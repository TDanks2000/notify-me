import type { Client } from "discord.js";

export default function (c: Client<true>, client: Client<true>) {
  console.log(`${c.user.username} is ready!`);
}
