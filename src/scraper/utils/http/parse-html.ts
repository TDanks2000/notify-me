import { HTMLElement, parse } from "node-html-parser";

export type HTMLParserRoot = HTMLElement;

export const parseHtml = (html: string): HTMLParserRoot => {
  return parse(html);
};
