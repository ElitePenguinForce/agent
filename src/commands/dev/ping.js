const { SlashCommandBuilder } = require ('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Retorna meu ping.'),
    async execute(interaction, client) {
        const message = await interaction.deferReply({
            fetchReply: true,
            ephemeral: true
        });

        const newMessage = `API: ${client.ws.ping}ms\nClient: ${message.createdTimestamp - interaction.createdTimestamp}ms`
        await interaction.editReply({
            content: newMessage
        });
    }
}