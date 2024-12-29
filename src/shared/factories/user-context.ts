import {
  ApplicationCommandType,
  type UserApplicationCommandData,
} from "discord.js";
import type { UserContext, UserContextExecute } from "../types/context.js";

type Props = {
  /**
   * @description The data of the user context command
   */
  data: Omit<UserApplicationCommandData, "type">;
  /**
   * @description The function that will be executed when the user context is executed
   */
  execute: UserContextExecute;
};

export default function createUserContext(props: Props): UserContext {
  return {
    data: {
      ...props.data,
      type: ApplicationCommandType.User,
    },
    execute: props.execute,
  };
}
