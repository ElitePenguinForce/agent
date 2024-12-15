import type { ModalSubmitInteraction } from "discord.js";

export default async function handleModalSubmitInteraction(
  interaction: ModalSubmitInteraction,
) {
  const modal = interaction.client.modals.get(interaction.customId);
  if (!modal) {
    throw new Error(
      `Modal executor not found for: "${interaction.customId}" custom id`,
    );
  }

  try {
    await modal.execute(interaction as ModalSubmitInteraction<"cached">);
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
