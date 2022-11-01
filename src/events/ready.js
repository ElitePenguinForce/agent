const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../config");

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log (`Logado em ${client.user.tag} (${client.user.id})`);
        const guild = client.guilds.cache.get(config.guild);
        await guild.members.fetch();
        await guild.commands.fetch();

        const formChannel = guild.channels.cache.get(config.formChannel);
        const message = (await formChannel?.messages?.fetch({ limit: 1 }).catch(() => null))?.first();
        
        if (!message || message.author.id !== client.user.id) {
            const embed = new EmbedBuilder()
                .setTitle("Embed de form")
                .setDescription("Se você representa um servidor que cumpre os requisitos listados acima e acha que ele merece fazer parte da EPF, clique no botao abaixo e preencha o formulário para enviá-lo para uma avaliação")
                .setColor("Random");

            const row = new ActionRowBuilder()
                .setComponents(
                    new ButtonBuilder()
                        .setCustomId("form-button")
                        .setLabel("Fazer Formulário")
                        .setStyle(ButtonStyle.Secondary)
                );

            formChannel.send({ embeds: [embed], components: [row] });
        }
    }
}