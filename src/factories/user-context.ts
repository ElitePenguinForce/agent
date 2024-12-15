import {
  ApplicationCommandType,
  type UserApplicationCommandData,
} from "discord.js";
import type {
  UserContext,
  UserContextExecute,
} from "../lib/types/user-context.js";

type Props = {
  data: Omit<UserApplicationCommandData, "type">;
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
