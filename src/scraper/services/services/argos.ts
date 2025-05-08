import { discordClient } from "@/scraper";
import type { FetchMethod, Service, ServiceRunContext } from "@/scraper/@types";
import { type HTMLParserRoot, parseHtml } from "@/scraper/utils";
import { stockEmbed } from "../shared";
import { EmbedBuilder } from "discord.js";

// Read IDs from environment
const GUILD_ID = process.env.DISCORD_GUILD_ID!;
const CHANNEL_NAME = process.env.DISCORD_CHANNEL_NAME!;

export default class ArgosService implements Service {
  readonly name = "Argos";
  readonly urls = [
    "https://www.argos.co.uk/product/7550333",
    "https://www.argos.co.uk/product/7550364",
  ];

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
    let title = "Unknown Product";
    try {
      const { html, retryWith, fetchMethod, url } = ctx;
      const root: HTMLParserRoot = parseHtml(html);

      title = root.querySelector("h1")?.text.trim() ?? title;

      const statusText = ArgosService.STATUS_SELECTORS
        .map(sel => root.querySelector(sel)?.text.trim())
        .find(t => t && t.length > 0);

      // Fetch server and channel from env-configured names/IDs
      const server = discordClient.guilds.cache.get(GUILD_ID);
      if (!server) {
        ctx.log("Discord server not found.");
        ctx.stats.errors++;
        return;
      }
      const channel = server.channels.cache.find(
        c => c.name?.toLowerCase() === CHANNEL_NAME.toLowerCase()
      );
      if (!channel?.isTextBased()) {
        ctx.log("Notify channel not found or invalid.");
        ctx.stats.errors++;
        return;
      }

      // Unknown status
      if (!statusText) {
        ctx.log("Status unknown — sending notification and retrying.");
        ctx.stats.errors++;

        const embed = new EmbedBuilder()
          .setTitle(`${this.name} – Unknown Status`)
          .setDescription(`Could not determine stock status for **${title}**.`);

        await channel.send({ embeds: [embed] });

        if (fetchMethod !== "fetch") {
          await retryWith("fetch");
        }
        return;
      }

      const isOutOfStock = this.isUnavailable(statusText);

      // Out-of-stock notification (simple embed)
      if (isOutOfStock) {
        ctx.log(`${title} — OUT OF STOCK`);
        const embed = new EmbedBuilder()
          .setTitle(`${this.name} – ${title}`)
          .setDescription(`The product **${title}** is currently out of stock.`);
        await channel.send({ embeds: [embed] });
        return;
      }

      // In-stock notification (full embed with image)
      let image =
        root
          .querySelector('[data-test="component-media-gallery"] img')
          ?.getAttribute("src") ??
        root.querySelector("img")?.getAttribute("src") ??
        "";
      if (image.startsWith("//")) image = `https:${image}`;

      ctx.log(`${title} — IN STOCK`);
      const embed = stockEmbed(true, {
        shop: this.name,
        title,
        url,
        image,
        description: `The **${title}** is now in stock!`,
      });
      await channel.send({ content: `<@${process.env.NOTIFY_USER_ID}>`, embeds: [embed] });

    } catch (error) {
      const msg = (error as Error).message;
      ctx.log(`Oops, that didn't go to plan — ${msg}`);
      ctx.stats.errors++;

      const server = discordClient.guilds.cache.get(GUILD_ID);
      const channel = server?.channels.cache.find(
        c => c.name?.toLowerCase() === CHANNEL_NAME.toLowerCase()
      );
      if (channel?.isTextBased()) {
        const embed = new EmbedBuilder()
          .setTitle(`${this.name} – Error`)
          .setDescription(`An error occurred while checking **${title}**: ${msg}`);
        await channel.send({ embeds: [embed] });
      }
    }
  }
}
