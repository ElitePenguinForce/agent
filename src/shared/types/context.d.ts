import type {
  ApplicationCommandType,
  MessageApplicationCommandData,
  MessageContextMenuCommandInteraction,
  UserApplicationCommandData,
  UserContextMenuCommandInteraction,
} from "discord.js";

export type UserContextExecute = (
  interaction: UserContextMenuCommandInteraction,
) => Promise<unknown>;

export type UserContext = {
  data: UserApplicationCommandData;
  execute: UserContextExecute;
};

export type MessageContextExecute = (
  interaction: MessageContextMenuCommandInteraction,
) => Promise<unknown>;

export type MessageContext = {
  data: MessageApplicationCommandData;
  execute: MessageContextExecute;
};

export type Context = UserContext | MessageContext;
export type ContextType =
  | ApplicationCommandType.Message
  | ApplicationCommandType.User;
