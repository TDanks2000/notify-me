import type { Service } from "@/scraper/@types";
import fs from "fs";
import path from "node:path";
import { pathToFileURL } from "url";

export const loadServicesFromFolder = async (
  folderPath: string
): Promise<Array<Service>> => {
  const services: Array<Service> = [];

  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    if (file.endsWith(".ts") || file.endsWith(".js")) {
      const filePath = path.join(folderPath, file);
      const fileUrl = pathToFileURL(filePath).href;
      const serviceModule = await import(fileUrl);
      const ServiceClass = serviceModule.default;

      if (ServiceClass) {
        const instance = new ServiceClass();
        services.push(instance as Service);
      }
    }
  }

  return services;
};
