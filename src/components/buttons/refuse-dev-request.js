const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
  data: {
    name: "refuse-dev-request"
  },
  
  async execute(interaction, client) {
    const modal = new ModalBuilder()
      .setTitle("Elite Penguin Force")
      .setCustomId(`devRefuseReasonModal:${interaction.customId.split(':')[1]}`);

    const reasonInput = new TextInputBuilder()
        .setCustomId("reason")
        .setLabel("Defina um motivo")
        .setRequired(false)
        .setStyle(TextInputStyle.Paragraph);

    modal.addComponents(new ActionRowBuilder().setComponents(reasonInput));

    await interaction.showModal(modal);
  }
}