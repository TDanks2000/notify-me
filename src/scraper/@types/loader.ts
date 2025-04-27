export interface LoadPageOptions {
  headless?: boolean;
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
  };
  windowSize?: {
    width: number;
    height: number;
  };
  windowPosition?: {
    x: number;
    y: number;
  };
  proxy?: string;
}
