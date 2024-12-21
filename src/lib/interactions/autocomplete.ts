import type { AutocompleteInteraction } from "discord.js";
import path from "path";

export default async function handleAutocompleteInteraction(
  interaction: AutocompleteInteraction,
) {
  const key = [
    interaction.commandName,
    interaction.options.getSubcommandGroup(false),
    interaction.options.getSubcommand(false),
    interaction.options.getFocused(true).name,
  ]
    .filter(Boolean)
    .join(path.sep);

  const autocomplete = interaction.client.autocompletes.get(key);
  if (!autocomplete) {
    return;
  }

  try {
    await autocomplete.execute(interaction);
  } catch (error) {
    console.error(error);
  }
}
