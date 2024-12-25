import type { ChatInputCommandInteraction, Interaction } from "discord.js";
import { getJavascriptPaths, importUsingRoot } from "../shared/helpers/path.js";
import type { Command } from "../shared/types/command.js";

class CommandService {
  private commands: Map<string, Command> = new Map();

  private validateCommandImport(
    command: unknown,
    path: string,
  ): asserts command is Command {
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
    const paths = getJavascriptPaths("./dist/src/features/").filter((path) =>
      path.includes("/commands/"),
    );

    for (const path of paths) {
      const command = (await importUsingRoot(path)).default;
      this.validateCommandImport(command, path);
      this.commands.set(command.data.name, command);
    }
  }

  public getCommand(name: string) {
    if (this.commands.size === 0) {
      throw new Error("Commands not loaded");
    }

    return this.commands.get(name);
  }

  public getCommands() {
    if (this.commands.size === 0) {
      throw new Error("Commands not loaded");
    }

    return [...this.commands.values()];
  }

  public async handleCommandInteraction(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = this.commands.get(interaction.commandName);
    if (!command) {
      return;
    }

    if (interaction.inRawGuild()) {
      await interaction.client.guilds
        .fetch(interaction.guildId)
        .catch(() => null);
    }

    try {
      await command.execute(
        interaction as ChatInputCommandInteraction<"cached">,
      );
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
}

export default new CommandService();
