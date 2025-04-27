import { Client, Collection } from "discord.js";
import path from "node:path";
import { Handler } from "../handler";
import { clientOptions } from "./utils/ClientOptions";

export class ClientClass extends Client {
  public buttons = new Collection();
  public console = console;

  constructor() {
    super(clientOptions);
  }

  public async init() {
    console.info("Bot is loading...");

    new Handler({
      client: this,
      commandsPath: path.join(__dirname, "..", "commands"),
      eventsPath: path.join(__dirname, "..", "events"),
      // componentsPath: path.join(__dirname, "..", "components"),
      // validationsPath: path.join(__dirname, "..", "validations"),
    });

    const TOKEN =
      (process.env.NODE_ENV === "production"
        ? process.env.DISCORD_TOKEN
        : process.env.DISCORD_TOKEN_DEV) ?? process.env.DISCORD_TOKEN;
    await this.login(TOKEN);
  }
}
