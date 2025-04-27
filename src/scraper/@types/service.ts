import type { ClientClass } from "@discord/structure";
import type { Page } from "puppeteer";

export type FetchMethod = "fetch" | "puppeteer" | "puppeteer-headless";

export interface RunContext {
  url: string;
  html: string;
  fetchMethod: FetchMethod;
  page?: Page;
  retryWith: (method: FetchMethod) => Promise<string>;
  log: (message: string) => void;
  cache?: Map<string, string>;
}

export type RegistryEntry = {
  service: Service;
  urls: string[];
};

export interface ServiceConstructor {
  new (discord?: ClientClass): Service;
}

export interface ServiceStats {
  processedUrls: number;
  errors: number;
  startTime: number;
  endTime?: number;
}

export interface ServiceRunContext {
  url: string;
  html: string;
  fetchMethod: FetchMethod;
  page?: Page;
  retryWith: (method: FetchMethod) => Promise<void>;
  log: (msg: string) => void;
  cache?: Map<string, string>;
  stats: ServiceStats;
}

export interface Service {
  urls: readonly string[];
  discord?: ClientClass;
  concurrencyLimit?: number;
  initialFetchMethod?: FetchMethod;

  run?: (ctx: ServiceRunContext) => Promise<void>;
  finish?: () => Promise<void>;
  onRequest?: (request: any) => void;
  onResponse?: (response: any) => void;
}

export type ServiceRegistryBaseOptions = {
  headless?: boolean;
  browserOptions?: import("./loader").LoadPageOptions;
  debug?: boolean;
  concurrencyLimit?: number;
};

export type ServiceRegistryOptions = ServiceRegistryBaseOptions &
  ({ useFileRouter: true; fileRouterPath: string } | { useFileRouter?: false });
