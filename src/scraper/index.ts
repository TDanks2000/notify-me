import { DiscordClient } from "@/discord";
import { join } from "path";
import { ServiceRegistry } from "./services/service-registry";
import { startInterval } from "./utils/interval";

export * from "./services/service-registry";

const servicesPath = join(__dirname, "services", "services");
export const discordClient = new DiscordClient();

export const registry = new ServiceRegistry({
  useFileRouter: true,
  fileRouterPath: servicesPath,
  debug: true,
  concurrencyLimit: 2,
  headless: true,
  browserOptions: {
    windowSize: {
      width: 100,
      height: 100,
    },
  },
});

(async () => {
  await discordClient.init();

  console.log(startInterval());
})();
