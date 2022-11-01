module.exports = {
  data: {
    name: "request-dev-role-form"
  },
  async execute(interaction, client) {
    return interaction.reply({ content: 'O formulário não está disponível no momento', ephemeral: true });
  }
}