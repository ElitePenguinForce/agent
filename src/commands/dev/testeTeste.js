const { ContextMenuCommandBuilder, ApplicationCommandType, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require ('discord.js')

module.exports = {
    data: new ContextMenuCommandBuilder()
    .setName('Banir')
    .setType(ApplicationCommandType.User),
    async execute(interaction, client) {
        const modal = new ModalBuilder()
        .setCustomId(`test-modal`)
        .setTitle(`Banimento de ${interaction.targetUser.tag}`)

        const textInput = new TextInputBuilder()
        .setCustomId(`testInput`)
        .setLabel(`Qual o motivo do banimento?`)
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder().addComponents(textInput));

        await interaction.showModal(modal);
    }
}