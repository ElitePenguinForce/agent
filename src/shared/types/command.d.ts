import type {
  CacheType,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
} from "discord.js";

export type Command<C extends CacheType = "cached"> = {
  data: ChatInputApplicationCommandData;
  /**
   * Whether the command should be active or not
   * @default true
   */
  active?: boolean;
  execute: (
    interaction: ChatInputCommandInteraction<C>,
  ) => unknown | Promise<unknown>;
};
