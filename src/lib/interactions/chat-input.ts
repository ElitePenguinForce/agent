import type { ChatInputCommandInteraction } from "discord.js";

export default async function handleChatInputInteraction(
  interaction: ChatInputCommandInteraction,
) {
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    throw new Error(
      `Command not found for "${interaction.commandName}" command name`,
    );
  }

  try {
    await command.execute(interaction as ChatInputCommandInteraction<"cached">);
  } catch (error) {
    console.error(error);
    await interaction[
      interaction.replied || interaction.deferred ? "followUp" : "reply"
    ]({
      content: "Não foi possível executar esse comando no momento",
      ephemeral: true,
    });
  }
}
