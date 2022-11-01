module.exports = {
  data: {
    name: "aprove-form"
  },
  async execute(interaction, client) {
    return interaction.reply({ content: "Botão", ephemeral: true });
  }
}