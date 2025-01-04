import {
  ApplicationCommandType,
  type UserApplicationCommandData,
} from "discord.js";
import type { Command, CommandExecute } from "../types/command.js";

type Props = {
  /**
   * @description The data of the user context command
   */
  data: Omit<UserApplicationCommandData, "type">;
  /**
   * @description The function that will be executed when the user context is executed
   */
  execute: CommandExecute<"user", "cached">;
};

export default function createUserContext(props: Props): Command<"user"> {
  return {
    data: {
      ...props.data,
      type: ApplicationCommandType.User,
    },
    execute: props.execute,
  };
}
