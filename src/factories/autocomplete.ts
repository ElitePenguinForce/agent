import type { AutocompleteInteraction, CacheType } from "discord.js";

export default function createAutocomplete<
  T extends CacheType = "cached",
>(autocomplete: {
  execute: (
    interaction: AutocompleteInteraction<T>,
  ) => Promise<unknown> | unknown;
}) {
  return autocomplete;
}
