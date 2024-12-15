import {
  ApplicationCommandType,
  type CacheType,
  type ChatInputApplicationCommandData,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../lib/types/command.js";

export default function createCommand<T extends CacheType = "cached">(command: {
  data: ChatInputApplicationCommandData;
  active?: boolean;
  execute: (
    interaction: ChatInputCommandInteraction<T>,
  ) => Promise<unknown> | unknown;
}): Command<T> {
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
