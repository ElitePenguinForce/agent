import type { AutocompleteInteraction, CacheType } from "discord.js";

export type Autocomplete<C extends CacheType = "cached"> = {
  /**
   * The name of the option that will trigger the autocomplete
   */
  name: string;
  /**
   * The name of the command that owns the autocomplete
   */
  command: string;
  /**
   * The name of the subcommand that owns the autocomplete
   */
  subcommand?: string;
  /**
   * The name of the subcommand group that owns the sub command
   */
  subcommandGroup?: string;
  /**
   * The function that will be executed when the autocomplete is triggered
   */
  execute: (
    interaction: AutocompleteInteraction<C>,
  ) => Promise<unknown> | unknown;
};
