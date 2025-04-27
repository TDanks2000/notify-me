import type { Service } from "@/scraper/@types";
import { parseHtml } from "@/scraper/utils/http/parse-html";
import type { Page } from "puppeteer";

export class PageProcessor {
  constructor(private readonly service: Service) {}

  async process(page: Page) {
    if (!this.service.urls?.length) {
      console.warn(`${this.service.constructor.name} has no URLs.`);
      return;
    }

    for (const url of this.service.urls) {
      console.log(`→ ${this.service.constructor.name} → ${url}`);
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

      const html = await page.content();
      const root = parseHtml(html);

      if (typeof this.service.run === "function") {
        await this.service.run(page, html, root);
      }

      if (typeof this.service.finish === "function") {
        await this.service.finish();
      }
    }
  }
}
