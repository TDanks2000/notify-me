import type { LoadPageOptions } from "@/scraper/@types";
import type { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export async function loadPage(
  url: string,
  options: LoadPageOptions = {}
): Promise<{ browser: Browser; page: Page }> {
  const launchArgs: string[] = ["--no-sandbox", "--disable-setuid-sandbox"];
  if (options.windowSize) {
    launchArgs.push(
      `--window-size=${options.windowSize.width},${options.windowSize.height}`
    );
  }
  if (options.proxy) {
    launchArgs.push(`--proxy-server=${options.proxy}`);
  }

  const executablePath = process.env.CHROME_EXECUTABLE_PATH;

  const browser = await puppeteer.launch({
    headless: true,
    args: launchArgs,
    ...(executablePath ? { executablePath: executablePath } : {}),
  });

  const page = await browser.newPage();

  if (options.userAgent) await page.setUserAgent(options.userAgent);
  if (options.viewport) await page.setViewport(options.viewport);

  await page.goto(url, { waitUntil: "networkidle2", timeout: 60_000 });

  return { browser, page };
}
