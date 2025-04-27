import { modeEnum } from "@/discord/@types";
import {
  startInterval,
  stopInterval,
  toggleInterval,
} from "@/scraper/utils/interval";
import type {
  CommandData,
  CommandOptions,
  SlashCommandProps,
} from "@discord/handler";
import { ApplicationCommandOptionType } from "discord.js";

export const data: CommandData = {
  name: "scrapper-toggle",
  description: "Toggle the scraper",
  options: [
    {
      name: "mode",
      description: "The mode to toggle",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
};

export function run({ interaction, client, handler }: SlashCommandProps) {
  const mode: modeEnum = interaction.options.getString("mode") as modeEnum;

  let data: string;
  switch (mode) {
    case modeEnum.start:
      data = startInterval();

      break;
    case modeEnum.stop:
      data = stopInterval();
      break;
    default:
      data = toggleInterval();
      break;
  }

  interaction.reply(data);
}

export const options: CommandOptions = {
  devOnly: false,
  userPermissions: ["Administrator"],
  botPermissions: ["Administrator"],
  deleted: false,
};
