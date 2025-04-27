import { discordClient } from "@/scraper";
import type { FetchMethod, Service, ServiceRunContext } from "@/scraper/@types";
import { type HTMLParserRoot, parseHtml } from "@/scraper/utils";
import { stockEmbed } from "../shared";

export default class ArgosService implements Service {
  readonly name = "Argos";
  readonly urls = [
    "https://www.argos.co.uk/product/7550333",
    "https://www.argos.co.uk/product/7550364",
  ];

  /** ← NEW: start with a simple fetch instead of Puppeteer */
  readonly initialFetchMethod: FetchMethod = "fetch";

  private static readonly STATUS_SELECTORS = [
    "p#fulfilment-search-stock-search-input-search-label strong",
    '[data-test="fulfilment-heading"] strong',
  ];

  private isUnavailable(text: string | undefined): boolean {
    return (
      !!text &&
      /(unavailable|pre-order|sold out|out of stock|not available)/i.test(text)
    );
  }

  public async run(ctx: ServiceRunContext): Promise<void> {
    try {
      const { html, page, url, retryWith } = ctx;

      // parse HTML using your existing parseHtml helper
      const root: HTMLParserRoot = parseHtml(html);

      const statusText = ArgosService.STATUS_SELECTORS.map((sel) =>
        root.querySelector(sel)?.text.trim()
      ).find((t) => t && t.length > 0);

      const title = root.querySelector("h1")?.text.trim() ?? "Unknown Product";

      let image =
        root
          .querySelector('[data-test="component-media-gallery"] img')
          ?.getAttribute("src") ??
        root.querySelector("img")?.getAttribute("src") ??
        "";

      if (image.startsWith("//")) image = `https:${image}`;

      const server = discordClient.guilds.cache.get("1022529794077884506");
      if (!server) {
        ctx.log("Discord server not found.");
        return;
      }

      const channel = server.channels.cache.find(
        (c) => c.name?.toLowerCase() === "notify-me"
      );

      if (!channel || !channel.isTextBased()) {
        ctx.log("Notify channel not found or invalid.");
        return;
      }

      const isOutOfStock = this.isUnavailable(statusText);
      const embed = stockEmbed(!isOutOfStock, {
        shop: this.name,
        title,
        url,
        image,
        description: isOutOfStock
          ? `The ${title} is currently out of stock!`
          : `The ${title} is now in stock!`,
      });

      ctx.log(`${title} — ${isOutOfStock ? "OUT OF STOCK" : "IN STOCK"}`);

      await channel.send({
        content: isOutOfStock ? undefined : `<@86268926450757632>`,
        embeds: [embed],
      });

      if (!statusText && ctx.fetchMethod !== "fetch") {
        ctx.log("No status text found — retrying with fetch.");
        await retryWith("fetch");
      }
    } catch (error) {
      ctx.log(`Error: ${(error as Error).message}`);
      ctx.stats.errors += 1;
    }
  }
}
