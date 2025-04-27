import type { FetchMethod, LoadPageOptions } from "@/scraper/@types";
import { loadPage } from "./load-page";

export async function loadContent(
  url: string,
  method: FetchMethod,
  page?: any,
  headless = true,
  browserOptions: LoadPageOptions = {},
  cache?: Map<string, string>
): Promise<{ html: string; page?: any; browser?: any }> {
  // return cached HTML if present
  if (cache?.has(url)) {
    return { html: cache.get(url)! };
  }

  // simple fetch
  if (method === "fetch") {
    const res = await fetch(url);
    const html = await res.text();
    cache?.set(url, html);
    return { html };
  }

  // puppeteer-based load
  const { browser, page: newPage } = page
    ? { browser: undefined, page }
    : await loadPage(url, { headless, ...browserOptions });

  await newPage.goto(url, { waitUntil: "networkidle2", timeout: 60_000 });
  const html = await newPage.content();

  cache?.set(url, html);
  return { html, page: newPage, browser };
}
