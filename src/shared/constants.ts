import { pathToFileURL } from "url";

export const DISCORD_INVITE_REGEX = /discord\.com\/(api\/)?oauth2\/authorize/gi;
export const MAX_MESSAGE_CONTENT_LENGTH = 2000;
export const ALMOST_TWO_WEEKS = 1209540000;
export const ALPHABET = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];
export const ROOT = pathToFileURL(process.cwd()).href;
