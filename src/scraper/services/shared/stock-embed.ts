import { EmbedBuilder } from "discord.js";

export const stockEmbed = (
  inStock: boolean,
  extra?: {
    title?: string;
    shop?: string;
    image?: string;
    description?: string;
    url?: string;
  }
) => {
  const embed = new EmbedBuilder()
    .setTitle(extra?.title ?? "Stock Check")
    .setDescription(
      extra?.description ??
        `The stock is ${inStock ? "in" : "not in"} stock${
          !!extra?.shop && ` at ${extra.shop}`
        }.`
    )
    .setColor(inStock ? 0x00ff00 : 0xff0000)
    .setTimestamp()
    .setFooter({
      text: extra?.shop ?? "Stock Check",
      iconURL: extra?.image?.length ? extra.image : undefined,
    });

  if (extra?.image) embed.setImage(extra.image);
  if (extra?.url) embed.setURL(extra.url);

  return embed;
};
