import type { Interaction } from "discord.js";
import { getJavascriptPaths, importUsingRoot } from "../shared/helpers/path.js";
import type { Context, ContextType } from "../shared/types/context.js";

/**
 * @description The service that handles the contexts
 */
class ContextService {
  private contexts: Map<ContextType, Map<string, Context>> = new Map();

  /**
   * @description Validates the context import
   *
   * @param context The context to validate
   * @param path The path of the context
   */
  private validateContextImport(
    context: unknown,
    path: string,
  ): asserts context is Context {
    if (
      typeof context !== "object" ||
      context === null ||
      !("data" in context) ||
      !("execute" in context)
    ) {
      throw new Error(`Invalid command import: ${path}`);
    }
  }

  /**
   * @description Loads the contexts
   */
  public async load() {
    const paths = getJavascriptPaths("./dist/src/app/").filter((path) =>
      path.includes("/contexts/"),
    );

    for (const path of paths) {
      const context = (await importUsingRoot(path)).default;
      this.validateContextImport(context, path);

      if (!this.contexts.has(context.data.type)) {
        this.contexts.set(
          context.data.type,
          new Map([[context.data.name, context]]),
        );
      }

      this.contexts.get(context.data.type)!.set(context.data.name, context);
    }
  }

  /**
   * @description Gets a context by its name and type
   *
   * @param name The name of the context
   * @param type The type of the context
   * @returns The context
   */
  public getContext(name: string, type: ContextType) {
    if (this.contexts.size === 0) {
      throw new Error("Contexts not loaded");
    }

    return this.contexts.get(type)?.get(name);
  }

  /**
   * @description Gets all the contexts
   *
   * @returns The contexts
   */
  public getContexts() {
    if (this.contexts.size === 0) {
      throw new Error("Contexts not loaded");
    }

    return [...this.contexts.values()].flatMap((context) => [
      ...context.values(),
    ]);
  }

  /**
   * @description Handles the context interaction
   *
   * @param interaction The interaction
   */
  public async handleContextInteraction(interaction: Interaction) {
    if (!interaction.isContextMenuCommand()) {
      return;
    }

    const context = this.contexts
      .get(interaction.commandType)
      ?.get(interaction.commandName);
    if (!context) {
      return;
    }

    if (interaction.inRawGuild()) {
      await interaction.client.guilds
        .fetch(interaction.guildId)
        .catch(() => null);
    }

    try {
      // @ts-expect-error type skill issue
      await context.execute(interaction);
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

export default new ContextService();
