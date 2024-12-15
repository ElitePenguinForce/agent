import type { ContextMenuCommandInteraction } from "discord.js";

export default async function handleContextInteraction(interaction: ContextMenuCommandInteraction) {
  const context = interaction.client.contexts[interaction.type].get(interaction.commandName);
  if (!context) return;

  try {
    // @ts-expect-error
    await context.execute(interaction);
  } catch (error) {
    console.error(error);
  }
}
