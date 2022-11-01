const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
  data: {
    name: "refuse-server-form"
  },
  async execute(interaction, client) {
    const modal = new ModalBuilder()
      .setTitle("Elite Penguin Force")
      .setCustomId("serverRefuseReasonModal");

    const reasonInput = new TextInputBuilder()
      .setCustomId("reason")
      .setLabel("Defina um motivo")
      .setRequired(false)
      .setStyle(TextInputStyle.Paragraph);

    modal.addComponents(new ActionRowBuilder().setComponents(reasonInput));

    interaction.showModal(modal);
  }
}