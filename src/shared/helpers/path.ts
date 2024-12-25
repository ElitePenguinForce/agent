import { readdirSync } from "fs";
import { ROOT } from "../constants.js";

export function deepReadDirectory(dir: string) {
  return readdirSync(dir, {
    recursive: true,
    encoding: "utf-8",
    withFileTypes: true,
  }).map((path) => path.parentPath + "/" + path.name);
}

export function getJavascriptPaths(dir: string) {
  return deepReadDirectory(dir).filter((path) => path.endsWith(".js"));
}

export function importUsingRoot(path: string) {
  return import(ROOT + "/" + path);
}
