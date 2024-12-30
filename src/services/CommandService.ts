import {
  ApplicationCommandType,
  type AutocompleteInteraction,
  type Interaction,
} from "discord.js";
import { getJavascriptPaths, importUsingRoot } from "../shared/helpers/path.js";
import type { Command, CommandType } from "../shared/types/command.js";

/**
 * @description The service that handles the commands
 */
class CommandService {
  private commands: Map<
    ApplicationCommandType,
    Map<string, Command<CommandType>>
  > = new Map();

  private validateCommandImport(
    command: unknown,
    path: string,
  ): asserts command is Command<CommandType> {
    if (
      typeof command !== "object" ||
      command === null ||
      !("data" in command) ||
      !("execute" in command)
    ) {
      throw new Error(`Invalid command import: ${path}`);
    }
  }

  public async load() {
    const paths = getJavascriptPaths("./dist/src/app/").filter((path) =>
      path.includes("/commands/"),
    );

    for (const path of paths) {
      const command = (await importUsingRoot(path)).default;
      this.validateCommandImport(command, path);

      if (!command.data.type) {
        console.warn(`Command ${command.data.name} has no type`);
        continue;
      }

      if (this.commands.has(command.data.type)) {
        this.commands.get(command.data.type)!.set(command.data.name, command);
        continue;
      }

      this.commands.set(
        command.data.type,
        new Map([[command.data.name, command]]),
      );
    }
  }

  public getCommand(type: ApplicationCommandType, name: string) {
    if (this.commands.size === 0) {
      throw new Error("Commands not loaded");
    }

    return this.commands.get(type)?.get(name);
  }

  public getCommands() {
    if (this.commands.size === 0) {
      throw new Error("Commands not loaded");
    }

    return [...this.commands.values()].flatMap((commands) => [
      ...commands.values(),
    ]);
  }

  /**
   * Get the autocomplete for a given key
   * @param key The key to get the autocomplete for, composed by subcommand, subcommand group and option name, separated by dots
   */
  public getAutocomplete(commandName: string, key: string) {
    const command = this.commands
      .get(ApplicationCommandType.ChatInput)
      ?.get(commandName);
    if (!command) {
      return null;
    }

    const autocomplete = command.autocomplete?.get(key);
    if (!autocomplete) {
      return null;
    }

    return autocomplete;
  }

  public async handleCommandInteraction(interaction: Interaction) {
    if (!interaction.isCommand()) {
      return;
    }

    const command = this.commands
      .get(interaction.commandType)
      ?.get(interaction.commandName);
    if (!command) {
      return;
    }

    if (interaction.inRawGuild()) {
      await interaction.client.guilds
        .fetch(interaction.guildId)
        .catch(() => null);
    }

    try {
      // @ts-expect-error just ignore this error
      await command.execute(interaction);
    } catch (error) {
      console.error(error);

      const reply = interaction.replied
        ? interaction.followUp
        : interaction.reply;
      await reply({
        content: "Ocorreu um erro ao executar este comando.",
        ephemeral: true,
      });
    }
  }

  public async handleAutocompleteInteraction(
    interaction: AutocompleteInteraction,
  ) {
    const key = [
      interaction.options.getSubcommandGroup(false),
      interaction.options.getSubcommand(false),
      interaction.options.getFocused(true).name,
    ]
      .filter(Boolean)
      .join(".");

    const autocomplete = this.getAutocomplete(interaction.commandName, key);
    if (!autocomplete) {
      return;
    }

    try {
      await autocomplete(interaction as AutocompleteInteraction<"cached">);
    } catch (error) {
      console.error(error);
    }
  }
}

export default new CommandService();
