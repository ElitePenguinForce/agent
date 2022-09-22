const { SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require ('discord.js')

module.exports = {
    data: {
        name: `form-menu`
    },
    async execute(interaction, client) {
        const modal = new ModalBuilder()
        .setCustomId(`serverRequestModal`)
        .setTitle(`Elite Penguin Force`)

        const serverLink = new TextInputBuilder()
        .setCustomId(`serverLink`)
        .setLabel(`Link permanente do servidor`)
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setMinLength(10)
        .setMaxLength(30);

        const question1 = new TextInputBuilder()
        .setCustomId(`question1`)
        .setLabel(`Você representa esse servidor?`)
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setMinLength(3)
        .setMaxLength(3);


        const question2 = new TextInputBuilder()
        .setCustomId(`question2`)
        .setLabel(`Conte-nos mais sobre esse servidor`)
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph)
        .setMinLength(20)
        .setMaxLength(150);

        const question3 = new TextInputBuilder()
        .setCustomId(`question3`)
        .setLabel(`Por que seu servidor deveria ser aceito?`)
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph)
        .setMinLength(20)
        .setMaxLength(250);

        const question4 = new TextInputBuilder()
        .setCustomId(`question4`)
        .setLabel(`Por onde você conheceu a EPF?`)
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph)
        .setMinLength(20)
        .setMaxLength(150);

        modal.addComponents(new ActionRowBuilder().addComponents(serverLink));
        modal.addComponents(new ActionRowBuilder().addComponents(question1));
        modal.addComponents(new ActionRowBuilder().addComponents(question2));
        modal.addComponents(new ActionRowBuilder().addComponents(question3));
        modal.addComponents(new ActionRowBuilder().addComponents(question4));

        await interaction.showModal(modal);
    }
}