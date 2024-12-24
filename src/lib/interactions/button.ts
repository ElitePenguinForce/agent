import type { ButtonInteraction } from "discord.js";

export default async function handleButtonInteraction(
  interaction: ButtonInteraction,
) {
  const id = interaction.customId.split(":")[0];
  if (!id) {
    throw new Error(
      `Button id not found for "${interaction.customId}" custom id`,
    );
  }

  const command = interaction.client.components.buttons.get(id);
  if (!command) {
    throw new Error(`Button not found for "${interaction.customId}" custom id`);
  }

  try {
    await command.execute(interaction as ButtonInteraction<"cached">);
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
