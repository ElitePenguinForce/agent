import type {
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
