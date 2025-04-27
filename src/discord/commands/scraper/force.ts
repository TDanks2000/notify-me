import { runAll } from "@/scraper/utils/interval";
import type {
  CommandData,
  CommandOptions,
  SlashCommandProps,
} from "@discord/handler";

export const data: CommandData = {
  name: "scraper-force",
  description: "Force a run of all the services",
};

export async function run({ interaction, client, handler }: SlashCommandProps) {
  try {
    if (!interaction.replied) {
      await interaction.deferReply();
    }

    await runAll();

    await interaction.editReply("Force started a run of the services.");
  } catch (error) {
    console.error(error);

    if (!interaction.replied) {
      await interaction.deferReply();
    }
    await interaction.editReply("Error: forcing a run of the services.");
  }
}

export const options: CommandOptions = {
  devOnly: false,
  userPermissions: ["Administrator"],
  botPermissions: ["Administrator"],
  deleted: false,
};
