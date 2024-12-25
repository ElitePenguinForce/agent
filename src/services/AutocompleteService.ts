import type { AutocompleteInteraction } from "discord.js";
import { getJavascriptPaths, importUsingRoot } from "../shared/helpers/path.js";
import type { Autocomplete } from "../shared/types/autocomplete.js";
import safeCall from "../shared/helpers/safeCall.js";

class AutocompleteService {
  private autocompletes: Map<string, Autocomplete> = new Map();
  private separator = ".";

  private validateAutocompleteImport(
    autocomplete: unknown,
    path: string,
  ): asserts autocomplete is Autocomplete {
    if (
      typeof autocomplete !== "object" ||
      autocomplete === null ||
      !("name" in autocomplete) ||
      !("command" in autocomplete) ||
      !("execute" in autocomplete)
    ) {
      throw new Error(`Invalid autocomplete import: ${path}`);
    }
  }

  public async load() {
    const paths = getJavascriptPaths("./dist/src/features/").filter((path) =>
      path.includes("/autocompletes/"),
    );

    for (const path of paths) {
      const autocomplete = (await importUsingRoot(path)).default;
      this.validateAutocompleteImport(autocomplete, path);

      this.autocompletes.set(
        this.getKey(
          autocomplete.name,
          autocomplete.command,
          autocomplete.subcommand,
          autocomplete.subcommandGroup,
        ),
        autocomplete,
      );
    }
  }

  private getKey(
    name: string,
    command: string,
    subcommand?: string,
    subcommandGroup?: string,
  ) {
    return [name, command, subcommand, subcommandGroup]
      .filter(Boolean)
      .join(this.separator);
  }

  public getAutocomplete(
    name: string,
    command: string,
    subcommand?: string,
    subcommandGroup?: string,
  ) {
    return this.autocompletes.get(
      this.getKey(name, command, subcommand, subcommandGroup),
    );
  }

  public getAutocompletes() {
    return Array.from(this.autocompletes.values());
  }

  public async handleAutocompleteInteraction(
    interaction: AutocompleteInteraction,
  ) {
    const autocomplete = this.getAutocomplete(
      interaction.options.getFocused(true).name,
      interaction.commandName,
      interaction.options.getSubcommand(false) ?? undefined,
      interaction.options.getSubcommandGroup(false) ?? undefined,
    );

    if (!autocomplete) {
      return;
    }

    safeCall(
      autocomplete.execute,
      interaction as AutocompleteInteraction<"cached">,
    );
  }
}

export default new AutocompleteService();
