import {
  ApplicationCommandType,
  type CacheType,
  type ChatInputApplicationCommandData,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../../types/command.js";

type Options<C extends CacheType> = {
  data: ChatInputApplicationCommandData;
  active?: boolean;
  execute: (
    interaction: ChatInputCommandInteraction<C>,
  ) => Promise<unknown> | unknown;
};

export default function createCommand<C extends CacheType = "cached">(
  command: Options<C>,
): Command<C> {
  return {
    data: {
      dmPermission: false,
      defaultMemberPermissions: ["ViewChannel"],
      ...command.data,
      type: ApplicationCommandType.ChatInput,
    },
    active: command.active ?? true,
    execute: command.execute,
  };
}
