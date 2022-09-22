const { SlashCommandBuilder } = require ('discord.js')
const { create } = require('../../Repositories/Guild/Cases');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('db')
    .setDescription('db test'),
    async execute(interaction, client) {
        const message = await interaction.deferReply({
            fetchReply: true,
            ephemeral: true
        });

        const newMessage = `API: ${client.ws.ping}ms\nClient: ${message.createdTimestamp - interaction.createdTimestamp}ms`
        await interaction.editReply({
            content: newMessage
        });

        create({
            type: `Kick`,
            staff: interaction.user.tag,
            staffId: interaction.user.id,
            user: interaction.client.tag,
            guildId: interaction.guild.id,
            userId: interaction.client.id,
            duration: `Não especificado`,
            reason: `Sexo`
        });

    }
}