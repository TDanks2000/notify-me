import fs from "node:fs";
import path from "node:path";
import type { ComponentHandlerOptions } from "../../@types";

export class ComponentHandler {
  #data: ComponentHandlerOptions;

  constructor({ ...options }: ComponentHandlerOptions) {
    this.#data = options;
  }

  async init() {
    const allowedExtensions = /\.(js|mjs|cjs|ts)$/i;

    // Check if the componentsPath exists, return if it doesn't
    if (!fs.existsSync(this.#data.componentsPath)) return;

    const componentFolders = fs.readdirSync(this.#data.componentsPath);

    for (const folder of componentFolders) {
      const folderPath = path.join(this.#data.componentsPath, folder);

      const componentFile = fs
        .readdirSync(folderPath)
        .filter((path) => allowedExtensions.test(path));

      switch (folder) {
        case "buttons":
          for (const file of componentFile) {
            const buttonPath = path.join(folderPath, file);
            const button = require(buttonPath);
            this.#data.client.buttons.set(button.data.name, button);
          }
          break;

        default:
          break;
      }
    }
  }
}
