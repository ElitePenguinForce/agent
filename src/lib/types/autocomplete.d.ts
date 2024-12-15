import type { AutocompleteInteraction } from "discord.js";

export type Autocomplete = {
  execute: (interaction: AutocompleteInteraction) => Promise<unknown> | unknown;
};
