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

const { SlashCommandBuilder, PermissionsBitField, SlashCommandStringOption } = require("discord.js");
const config = require("../config.js");
const Command = require('../structures/command.js');

class ChangeInviteCommand extends Command {
    constructor() {
        super({
            active: true,
            data: new SlashCommandBuilder()
                .setName('changeinvite')
                .setNameLocalization('pt-BR', 'alterarconvite')
                .setDescription('Altere o convite de um servidor')
                .setDMPermission(false)
                .setDefaultMemberPermissions(PermissionsBitField.Flags.ViewChannel)
                .addStringOption(
                new SlashCommandStringOption()
                    .setName('server')
                    .setNameLocalization('pt-BR', 'servidor')
                    .setDescription('O servidor que você deseja alterar o convite')
                    .setAutocomplete(true)
                    .setRequired(true),
                )
                .addStringOption(
                new SlashCommandStringOption()
                    .setName('new_invite')
                    .setNameLocalization('pt-BR', 'novo_convite')
                    .setDescription('O novo convite para o servidor')
                    .setRequired(true),
                ),
        });
    }

    async execute(interaction, client) {
        const guildModel = require('../models/guild.js');
        const guildId = interaction.options.getString('server');
        require('../models/member.js');
        const guild = await guildModel.findById(guildId);

        if (!guild) 
            return interaction.reply({
                content: 'Servidor não encontrado ou removido... ID não está cadastrado no sistema',
                ephemeral: true,
            })
        
        //Uma verificação simples para ver se o usuário é representante da equipe, isto serve para quando
        //o comando falhar no passado e o usuário tentar chamá-lo novamente não sendo o representante no presente
        if ((guild.representative !== interaction.user.id) && !interaction.member.roles.cache.has(config.guard)) 
            return await interaction.reply({
                content: 'Você não é o representante dessa equipe.',
                ephemeral: true,
            })

        const newInvite = interaction.options.getString('new_invite');
        await client.fetchInvite(newInvite)
            .then(async (invite) => {
                if (invite.guild.id !== guildId) {
                    return await interaction.reply({
                        content: 'O convite não é válido para esse servidor',
                        ephemeral: true,
                    });
                }

        const guildDoc = await guildModel.findOneAndUpdate(
            { _id: guildId },
            {
                invite: invite.code,
                name: invite?.guild.name ?? guild.name,
            }
        );

        client.emit(
            'updateGuilds',
            false,
            `<:icon_guild:1037801942149242926> **|** Novo convite para o servidor **${guildDoc.name}** foi gerado`
        );

                return await interaction.reply({
                    content: (
                        `Convite do servidor \`${guild.name}\` alterado com sucesso!\n` +
                        `Novo convite: ${invite.url}`
                    ),
                });
            }, async () => {
                //Aqui é feita a verificação se o convite é válido, se não for, retornaremos uma mensagem de erro
                await interaction.reply({ content: 'Convite inválido... Tente novamente', ephemeral: true })
            });
    }

    async autocomplete$server(interaction, value){
        const guildModel = require('../models/guild.js');
        const name = {$regex: new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')};
        const representing = (
            interaction.member.roles.cache.has(config.guard)
            ? await guildModel.find({name}).sort({name: 1}).limit(25)
            : await guildModel.find({
                representative: interaction.user.id,
                name,
            }).sort({name: 1}).limit(25)
        );
        
        return representing.map(guildDoc => ({
            name: guildDoc.name,
            value: guildDoc._id,
        }));
    }
}

module.exports = new ChangeInviteCommand();
