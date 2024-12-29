import { readdirSync } from "fs";
import { ROOT } from "../constants.js";

/**
 * Reads a directory recursively and returns the paths of all files
 *
 * @param dir The directory to read
 * @returns The paths of all files in the directory
 */
export function deepReadDirectory(dir: string) {
  return readdirSync(dir, {
    recursive: true,
    encoding: "utf-8",
    withFileTypes: true,
  }).map((path) => path.parentPath + "/" + path.name);
}

/**
 * Gets the paths of all javascript files in a directory
 *
 * @param dir The directory to read
 * @returns The paths of all javascript files in the directory
 */
export function getJavascriptPaths(dir: string) {
  return deepReadDirectory(dir).filter((path) => path.endsWith(".js"));
}

/**
 * Imports a file using the root path
 *
 * @param path The path of the file to import
 * @returns The imported file
 */
export function importUsingRoot(path: string) {
  return import(ROOT + "/" + path);
}
