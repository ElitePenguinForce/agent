import type { ContextMenuCommandInteraction } from "discord.js";

export default async function handleContextInteraction(
  interaction: ContextMenuCommandInteraction,
) {
  const contexts = interaction.client.contexts[interaction.type];
  if (!contexts) {
    return;
  }

  const context = contexts.get(interaction.commandName);
  if (!context) {
    return;
  }

  try {
    // @ts-expect-error idk how to type, it can be a couple of interaction types
    await context.execute(interaction);
  } catch (error) {
    console.error(error);
  }
}
