import type { Browser, Page } from "puppeteer";
import type {
  FetchMethod,
  Service,
  ServiceRegistryOptions,
  ServiceRunContext,
  ServiceStats,
} from "../@types";
import { loadContent, loadPage } from "../utils";
import { loadServicesFromFolder } from "./file-router";

const DEFAULT_CONCURRENCY = 5;

export class ServiceRegistry {
  private services: Service[] = [];
  private cache = new Map<string, string>();
  private stats = new Map<Service, ServiceStats>();
  private initialized = false;

  constructor(private options: ServiceRegistryOptions) {}

  async init() {
    if (this.initialized) return;
    this.initialized = true;

    if (this.options.useFileRouter) {
      const svcs = await loadServicesFromFolder(this.options.fileRouterPath);
      svcs.filter((s) => s.urls?.length).forEach((s) => this.register(s));
    }
  }

  register(service: Service) {
    if (!this.services.includes(service)) {
      this.services.push(service);
    } else {
      this.log(`Service ${service.constructor.name} already registered.`);
    }
  }

  async runAll() {
    await this.init();
    if (this.services.length === 0) {
      this.log("No services to run.");
      return;
    }

    // setup first page via puppeteer to bootstrap
    const first = this.services[0];
    if (!first?.urls?.length) {
      this.log("First service has no URLs. Aborting.");
      return;
    }

    const firstUrl = first.urls[0];
    if (!firstUrl) return;

    const { browser, page } = await loadPage(firstUrl, {
      headless: this.options.headless,
      ...this.options.browserOptions,
    });

    try {
      // Handle initial fetch method selection
      const initialFetchMethod: FetchMethod =
        first.initialFetchMethod ?? "puppeteer";
      let currentMethod = initialFetchMethod;

      await this.runService(first, page, currentMethod);

      await this.runWithConcurrency(browser, this.services.slice(1));
    } finally {
      await browser.close();
    }
  }

  private async runService(
    service: Service,
    page?: Page,
    currentMethod: FetchMethod = "puppeteer"
  ) {
    // Use the provided currentMethod or fall back to service's initialFetchMethod if available
    currentMethod = currentMethod || service.initialFetchMethod || "puppeteer";

    // init stats
    this.stats.set(service, {
      processedUrls: 0,
      errors: 0,
      startTime: Date.now(),
    });

    for (const url of service.urls) {
      // retryWith implementation
      const retryWith = async (method: FetchMethod) => {
        this.log(`[${service.constructor.name}] retryWith(${method})`);
        const result = await loadContent(
          url,
          method,
          page,
          this.options.headless,
          this.options.browserOptions,
          this.cache
        );
        currentMethod = method;
        page = result.page;
      };

      try {
        // load initial content
        const { html } = await loadContent(
          url,
          currentMethod,
          page,
          this.options.headless,
          this.options.browserOptions,
          this.cache
        );

        // attach interceptors
        if (page) {
          service.onRequest && page.on("request", service.onRequest);
          service.onResponse && page.on("response", service.onResponse);
        }

        // Create a retryWith function that updates the context
        const retryWithAndUpdateContext = async (method: FetchMethod) => {
          await retryWith(method);
          // The retryWith function already updates currentMethod and page
          return;
        };

        // build context
        const ctx: ServiceRunContext = {
          url,
          html,
          fetchMethod: currentMethod,
          page,
          retryWith: retryWithAndUpdateContext,
          log: (msg) => this.log(`[${service.constructor.name}] ${msg}`),
          cache: this.cache,
          stats: this.stats.get(service)!,
        };

        this.log(`→ ${service.constructor.name} → ${url}`);

        // run + finish
        await service.run?.(ctx);
        await service.finish?.();

        // update stats
        this.stats.get(service)!.processedUrls += 1;
      } catch (err) {
        this.log(`Error in ${service.constructor.name} @ ${url}: ${err}`);
        this.stats.get(service)!.errors += 1;
      }
    }

    // mark endTime
    this.stats.get(service)!.endTime = Date.now();
  }

  private async runWithConcurrency(browser: Browser, services: Service[]) {
    const limit = this.options.concurrencyLimit ?? DEFAULT_CONCURRENCY;
    const queue = services.slice();
    const workers: Promise<void>[] = [];

    for (let i = 0; i < limit; i++) {
      workers.push(
        (async () => {
          while (queue.length) {
            const svc = queue.shift()!;
            const page = await browser.newPage();
            try {
              // Get the initialFetchMethod from the service or default to puppeteer
              const currentMethod: FetchMethod =
                svc.initialFetchMethod ?? "puppeteer";
              // Pass the currentMethod to runService to ensure it's respected
              await this.runService(svc, page, currentMethod);
            } finally {
              await page.close();
            }
          }
        })()
      );
    }

    await Promise.all(workers);
  }

  private log(msg: string) {
    if (this.options.debug) {
      const ts = new Date().toISOString();
      console.debug(`[${ts}] ${msg}`);
    }
  }
}
