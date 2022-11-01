module.exports = {
  data: {
    name: "refuse-form"
  },
  async execute(interaction, client) {
    return interaction.reply({ content: "Botão 2", ephemeral: true });
  }
}