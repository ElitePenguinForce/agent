import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default function createConfirmationButtons() {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("collector:confirm")
      .setLabel("Confirmar")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("collector:cancel")
      .setLabel("Cancelar")
      .setStyle(ButtonStyle.Danger),
  );
}
