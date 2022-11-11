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
            const registerServerEmbed = new EmbedBuilder()
                .setTitle(`${config.formChannelData.guildFormEmoji} **|** Aplicar Servidor`)
                .setImage(config.formChannelData.guildFormBanner)
                .setColor(config.formChannelData.guildFormColor)
                .setDescription(
                    `<:green_dot:1037803471077908553> **|** Se você representa um servidor que cumpre os requisitos listados acima e acha que ele merece fazer parte da **Elite Penguin Force**, clique no botão abaixo e preencha o formulário para enviá-lo para uma avaliação.\n\n`+
                    `<:icon_idle_green:1037806417438068766> **| Lembrando:** Você será avisado assim que a avaliação tenha terminado. Por isso lembre de deixar suas "Mensagens Diretas" abertas.`
                )
                
            const requestDevRoleEmbed = new EmbedBuilder()
                .setTitle(`${config.formChannelData.developerFormEmoji} **|** Aplicar para Desenvolvedor`)
                .setImage(config.formChannelData.developerFormBanner)
                .setColor(config.formChannelData.developerFormColor)
                .setDescription(
                    `<:yellow_dot:1037800367171317810> **|** Se você atualmente atua na área da programação que cumpre os requisitos listados acima e quer fazer parte da **Elite Penguin Force** como um Developer, clique no botão abaixo e preencha o formulário para enviá-lo para uma avaliação.\n\n`+
                    `<:icon_idle:1037801013358379048> **| Lembrando:** Você será avisado assim que a avaliação tenha terminado. Por isso lembre de deixar suas "Mensagens Diretas" abertas.`
                )

            const row = new ActionRowBuilder()
                .setComponents(
                    new ButtonBuilder()
                        .setCustomId("register-server-form")
                        .setLabel("Formulário de Servidor")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(config.formChannelData.guildFormEmoji),
                    new ButtonBuilder()
                        .setCustomId("request-dev-role-form")
                        .setLabel("Formulário de Desenvolvedor")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(config.formChannelData.developerFormEmoji),
                );

            formChannel.send({ embeds: [registerServerEmbed, requestDevRoleEmbed], components: [row] });
        }

        // se crashar ou reiniciar no meio de uma atualização, ele vai refazer essa atualização já
        // que a ela não foi finalizada devidamente
        const constantsModel = require('../models/constants');
        const constants = await constantsModel.getConstants();
        if (constants.updatingGuildsChannel || constants.scheduledUpdate) {
            await constantsModel.updateConstants({ updatingGuildsChannel: false, scheduledUpdate: false });
            client.emit('updateGuilds', false);
        }
    }
}