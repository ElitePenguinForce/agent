import type {
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  CacheType,
  ChannelType,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  LocalizationMap,
} from "discord.js";
import type { AutocompleteExecute } from "./autocomplete.js";

type BaseOption = {
  name: string;
  nameLocalizations?: LocalizationMap;
  description: string;
  descriptionLocalizations?: LocalizationMap;
  required?: boolean;
};

type Choise<T extends string | number> = {
  name: string;
  value: T;
};

type AutocompletableOption = {
  autocomplete: AutocompleteExecute;
  choices?: never;
};

type ChoosableOption<T extends string | number> = {
  choices: Choise<T>[];
  autocomplete?: never;
};

type BaseStringOption =
  & BaseOption
  & {
    minLength?: number;
    maxLength?: number;
    type: ApplicationCommandOptionType.String;
  };

type AutocompletableStringOption = BaseStringOption & AutocompletableOption;
type ChoosableStringOption = BaseStringOption & ChoosableOption<string>;

type BaseNumberOption =
  & BaseOption
  & {
    minValue?: number;
    maxValue?: number;
    type: ApplicationCommandOptionType.Number;
  };

type AutocompletableNumberOption = BaseNumberOption & AutocompletableOption;
type ChoosableNumberOption = BaseNumberOption & ChoosableOption<number>;

type BooleanOption = BaseOption & {
  type: ApplicationCommandOptionType.Boolean;
};

type UserOption = BaseOption & {
  type: ApplicationCommandOptionType.User;
};

type RoleOption = BaseOption & {
  type: ApplicationCommandOptionType.Role;
};

type ChannelOption = BaseOption & {
  type: ApplicationCommandOptionType.Channel;
  channelTypes: ChannelType[];
};

type MentionableOption = BaseOption & {
  type: ApplicationCommandOptionType.Mentionable;
};

type SubcommandOption = BaseOption & {
  type: ApplicationCommandOptionType.Subcommand;
  options: Exclude<CommandOption, SubcommandOption | SubcommandGroupOption>[];
};

type SubcommandGroupOption = BaseOption & {
  type: ApplicationCommandOptionType.SubcommandGroup;
  options: Exclude<CommandOption, SubcommandGroupOption>[];
};

export type CommandOption =
  | BaseStringOption
  | AutocompletableStringOption
  | ChoosableStringOption
  | AutocompletableNumberOption
  | ChoosableNumberOption
  | BooleanOption
  | UserOption
  | RoleOption
  | ChannelOption
  | MentionableOption
  | SubcommandOption
  | SubcommandGroupOption;

export type AutocompleteExecute<C extends CacheType = "cached"> = (
  interaction: AutocompleteInteraction<C>,
) => Promise<unknown> | unknown;

export type CommandData = Omit<ChatInputApplicationCommandData, "options">;

export type Command<C extends CacheType = "cached"> = {
  data: ChatInputApplicationCommandData;
  /**
   * Whether the command should be active or not
   * @default true
   */
  active?: boolean;
  autocomplete?: Map<string, AutocompleteExecute>;
  execute: (
    interaction: ChatInputCommandInteraction<C>,
  ) => unknown | Promise<unknown>;
};
