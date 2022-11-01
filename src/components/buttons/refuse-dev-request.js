module.exports = {
  data: {
    name: "refuse-dev-request"
  },
  async execute(interaction, client) {
    return interaction.reply({ content: 'botão' });
  }
}