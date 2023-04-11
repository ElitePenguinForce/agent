// Copyright (C) 2022  HordLawk & vitoUwu & PeterStark000

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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

        const serverFormChannel = guild.channels.cache.get(config.serverFormChannel);
        const serverFormMessage = (await serverFormChannel?.messages?.fetch({ limit: 1 }).catch(() => null))?.first();
        
        if (!serverFormMessage || serverFormMessage.author.id !== client.user.id) {
            const serverRequirementsEmbed = new EmbedBuilder()
                .setTitle('<:info:1095440963620573394> Requisitos:')
                .setImage(
                    'https://cdn.discordapp.com/attachments/1034845518452502658/1034845554796150815/Requisitos.png',
                )
                .setColor(config.formChannelData.guildFormColor)
                .setDescription(
                    '<:globe:1095440970516021298> Para adicionar algum servidor a EPF é necessário que tenha no' +
                    ' mínimo **5.000 membros** ou que sejam **verificados** ou **parceiros** do Discord e atenda a' +
                    ' todos os  [termos de serviço](https://discord.com/terms) e as' +
                    ' [diretrizes](https://discord.com/guidelines) do Discord.',
                )

            const registerServerEmbed = new EmbedBuilder()
                .setTitle(`${config.formChannelData.guildFormEmoji} Aplicar Servidor`)
                .setImage(config.formChannelData.guildFormBanner)
                .setColor(config.formChannelData.guildFormColor)
                .setDescription(
                    `<:green_dot:1037803471077908553> **|** Se você representa um servidor que cumpre os requisitos listados acima e acha que ele merece fazer parte da **Elite Penguin Force**, clique no botão abaixo e preencha o formulário para enviá-lo para uma avaliação.\n\n`+
                    `<:icon_idle_green:1037806417438068766> **| Lembrando:** Você será avisado assim que a avaliação tenha terminado. Por isso lembre de deixar suas "Mensagens Diretas" abertas.`
                )

            const row = new ActionRowBuilder()
                .setComponents(
                    new ButtonBuilder()
                        .setCustomId("register-server-form")
                        .setLabel("Formulário de Servidor")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(config.formChannelData.guildFormEmoji),
                );

            serverFormChannel.send({ embeds: [serverRequirementsEmbed, registerServerEmbed], components: [row] });
        }

        const devFormChannel = guild.channels.cache.get(config.devFormChannel);
        const devFormMessage = (await devFormChannel?.messages?.fetch({ limit: 1 }).catch(() => null))?.first();
        
        if (!devFormMessage || devFormMessage.author.id !== client.user.id) {
            const devRequirementsEmbed = new EmbedBuilder()
                .setTitle('<:info:1095440963620573394> Requisitos:')
                .setImage(
                    'https://cdn.discordapp.com/attachments/1034845518452502658/1034845554796150815/Requisitos.png',
                )
                .setColor(config.formChannelData.developerFormColor)
                .setDescription(
                    '<:monitor:1095441115936739450> Para receber o cargo <@&822202388780941313>, é necessário' +
                    ' que cumpra com algum dos seguintes requisitos:\n' +
                    '<:point_epf:1037183758761205841> Possuir um bot verificado (online);\n' +
                    '<:point_epf:1037183758761205841> Ter um bot privado de algum dos servidores associados à EPF;\n' +
                    '<:point_epf:1037183758761205841> Trabalhar com desenvolvimento de software;\n' +
                    '<:point_epf:1037183758761205841> Ter contribuições/projetos documentados no' +
                    ' [GitHub](https://github.com/).',
                )

            const requestDevRoleEmbed = new EmbedBuilder()
                .setTitle(`${config.formChannelData.developerFormEmoji} Aplicar para Desenvolvedor`)
                .setImage(config.formChannelData.developerFormBanner)
                .setColor(config.formChannelData.developerFormColor)
                .setDescription(
                    `<:yellow_dot:1037800367171317810> **|** Se você atualmente atua na área da programação que cumpre os requisitos listados acima e quer fazer parte da **Elite Penguin Force** como um Developer, clique no botão abaixo e preencha o formulário para enviá-lo para uma avaliação.\n\n`+
                    `<:icon_idle:1037801013358379048> **| Lembrando:** Você será avisado assim que a avaliação tenha terminado. Por isso lembre de deixar suas "Mensagens Diretas" abertas.`
                )

            const row = new ActionRowBuilder()
                .setComponents(
                    new ButtonBuilder()
                        .setCustomId("request-dev-role-form")
                        .setLabel("Formulário de Desenvolvedor")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(config.formChannelData.developerFormEmoji),
                );

            devFormChannel.send({ embeds: [devRequirementsEmbed, requestDevRoleEmbed], components: [row] });
        }

        // se crashar ou reiniciar no meio de uma atualização, ele vai refazer essa atualização já
        // que a ela não foi finalizada devidamente
        const constantsModel = require('../models/constants');
        const constants = await constantsModel.getConstants();
        if (constants.updatingGuildsChannel || constants.scheduledUpdate) {
            await constantsModel.updateConstants({
                updatingGuildsChannel: false,
                scheduledUpdate: false,
            });
            client.emit(
                'updateGuilds',
                true,
                '<:e_repeat:1049017561175568404> **|** A última atualização não foi bem sucedida, por isso será refeita'
            );
        }

        const clock = () => setTimeout(async () => {
            const now = Date.now()
            await guild.members.fetch();
            for(
                const member
                of guild.members.cache
                    .filter(m => ((m.roles.cache.size === 1) && (m.joinedTimestamp < (now - (24 * 60 * 60 * 1000)))))
                    .values()
            ) await member.kick();
            clock();
        }, 60 * 60 * 1000);
        clock();
    }
}
