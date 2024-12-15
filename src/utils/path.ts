import { readdirSync } from "fs";

export function deepReadDirectory(dir: string) {
  return readdirSync(dir, { recursive: true, encoding: "utf-8" });
}

export function getJavascriptPaths(dir: string) {
  return deepReadDirectory(dir).filter((path) => path.endsWith(".js"));
}
