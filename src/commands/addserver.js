// Copyright (C) 2025  HordLawk & vitoUwu & PeterStark000

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

const {
    SlashCommandBuilder,
    PermissionsBitField,
    SlashCommandStringOption,
} = require("discord.js");
const config = require("../config.js");
const Command = require("../structures/command.js");

class AddServerCommand extends Command {
    constructor() {
        super({
            active: true,
            data: new SlashCommandBuilder()
                .setName("addserver")
                .setDescription("Adiciona um servidor à database do agent.")
                .setDMPermission(false)
                .setDefaultMemberPermissions(
                    PermissionsBitField.Flags.ManageRoles
                )
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName('invite')
                        .setNameLocalization('pt-BR', 'convite')
                        .setDescription('O convite para o servidor')
                        .setRequired(true),
                ),
        });
    }

    async execute(interaction, client) {
        if (!interaction.member.roles.cache.has(config.guard)) {
            return await interaction.reply({
                content: "Apenas um guard pode adicionar servidores",
                ephemeral: true,
            });
        }
        const newInvite = interaction.options.getString('invite');
        const invite = await client.fetchInvite(newInvite).catch(() => null);
        if (!invite) return await interaction.reply({ content: 'Convite inválido... Tente novamente', ephemeral: true });
        const guildModel = require('../models/guild.js');
        const guildDoc = await guildModel.findById(invite.guild.id);
        if (guildDoc) return await interaction.reply({
            content: 'Servidor já cadastrado no sistema.',
            ephemeral: true,
        });
        const newGuildDoc = new guildModel({
            _id: invite.guild.id,
            representative: config.agent,
            invite: invite.code,
            name: invite.guild.name,
            owner: null,
            pending: false,
        });
        await newGuildDoc.save();

        client.emit(
            'updateGuilds',
            false,
            `<:icon_guild:1037801942149242926> **|** Novo servidor aprovado: **${newGuildDoc.name}**`
        );

        return await interaction.reply({content: `Servidor \`${newGuildDoc.name}\` adicionado com sucesso!`});
    }
}

module.exports = new AddServerCommand();
