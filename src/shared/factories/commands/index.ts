import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  type CacheType,
  type ChatInputCommandInteraction,
} from "discord.js";
import type {
  AutocompleteExecute,
  Command,
  CommandData,
  CommandOption,
} from "../../types/command.js";

type Options<C extends CacheType> = {
  /**
   * @description The command data used to create the command
   * @example
   * ```ts
   * {
   *    name: "ping",
   *    description: "Pings the bot",
   * }
   * ```
   */
  data: CommandData & { options?: CommandOption[] };
  /**
   * @description Whether the command should be active or not
   * @default true
   */
  active?: boolean;
  /**
   * @description The function that will be executed when the command is used
   */
  execute: (
    interaction: ChatInputCommandInteraction<C>,
  ) => Promise<unknown> | unknown;
};

function mapAutocompleteOptions(
  options: CommandOption[],
  parentName?: string,
): Map<string, AutocompleteExecute> {
  const autocompleteOptions: Map<string, AutocompleteExecute> = new Map();

  for (const option of options) {
    if ("options" in option) {
      const map = mapAutocompleteOptions(
        option.options,
        parentName ? `${parentName}.${option.name}` : option.name,
      );

      for (const [key, value] of map) {
        autocompleteOptions.set(key, value);
      }

      continue;
    }

    if (
      (option.type !== ApplicationCommandOptionType.String &&
        option.type !== ApplicationCommandOptionType.Number) ||
      !("autocomplete" in option) ||
      typeof option.autocomplete !== "function"
    ) {
      continue;
    }

    autocompleteOptions.set(
      parentName ? `${parentName}.${option.name}` : option.name,
      option.autocomplete,
    );
  }

  return autocompleteOptions;
}

export default function createCommand<C extends CacheType = "cached">(
  command: Options<C>,
): Command<C> {
  return {
    data: {
      dmPermission: false,
      defaultMemberPermissions: ["ViewChannel"],
      ...command.data,
      // @ts-expect-error just ignore this errors
      options: command.data.options?.map((option) => ({
        ...option,
        autocomplete: "autocomplete" in option || undefined,
      })),
      type: ApplicationCommandType.ChatInput,
    },
    autocomplete: mapAutocompleteOptions(command.data.options || []),
    active: command.active ?? true,
    execute: command.execute,
  };
}
