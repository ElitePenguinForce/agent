
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require ('discord.js')

module.exports = {
    data: {
        name: `serverRequestModal`
    },
    
    async execute(interaction, client) {
        const embed = new EmbedBuilder()
        .setTitle(`Formulário enviado`)
        .setDescription(`Sua solicitação foi enviada com sucesso\n\nFazer esse formulário **não** garante a entrada da sua comunidade na EPF. \nSua requisição passará por uma analise e a equipe determinará se seu servidor está apto ou não.`)
        .setColor('#fccf03')

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });

        const embed2 = new EmbedBuilder()
        .setTitle(`Novo formulário`)
        .setDescription(`**Enviado por:** ${interaction.user.tag} (${interaction.user.id})\n\n\n**Link permanente do servidor**\n"${interaction.fields.getTextInputValue("serverLink")}"\n\n**Você representa esse servidor?**\n"${interaction.fields.getTextInputValue("question1")}"\n\n**Conte-nos mais sobre esse servidor**\n"${interaction.fields.getTextInputValue("question2")}"\n\n**Por que seu servidor deveria ser aceito?**\n"${interaction.fields.getTextInputValue("question3")}"\n\n**Por onde você conheceu a EPF?**\n"${interaction.fields.getTextInputValue("question4")}"`)
        .setColor('#fccf03')

        client.channels.cache.get('1005334331570536631').send({embeds: [embed2]})
    }
}