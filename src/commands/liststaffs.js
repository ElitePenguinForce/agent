const { EmbedBuilder } = require('@discordjs/builders');
const { ContextMenuCommandBuilder, PermissionsBitField, ApplicationCommandType } = require('discord.js');
const Command = require('../structures/command.js');

class ListstaffsCommand extends Command{
    constructor(){
        super({
            active: true,
            data: new ContextMenuCommandBuilder()
                .setName('liststaffs')
                .setNameLocalizations({
                    "en-GB": 'List staffs',
                    "en-US": 'List staffs',
                    "pt-BR": 'Listar staffs',
                })
                .setDMPermission(false)
                .setDefaultMemberPermissions(PermissionsBitField.Flags.ViewChannel)
                .setType(ApplicationCommandType.User),
        });
    }

    async execute(interaction, client){
        const memberModel = require('../models/member.js');
        require('../models/guild.js');
        const memberDocs = await memberModel.find({user: interaction.targetUser.id}).populate({
            path: 'guild',
            populate: {path: 'representative'},
        });
        const embed = new EmbedBuilder()
            .setColor(0x2f3136)
            .setAuthor({
                name: `Staffs que ${interaction.targetUser.tag} faz parte`,
                iconURL: interaction.targetUser.avatarURL(),
            });
        const ownedGuilds = memberDocs.filter(doc => doc._id.equals(doc.guild.owner));
        if(ownedGuilds.length) embed.addFields({
            name: 'Dono',
            value: ownedGuilds
                .map(doc => (
                    `[\`${doc.guild.name}\`](https://discord.gg/${doc.guild.invite})` +
                    `${(doc.guild.representative.user === interaction.targetUser.id) ? ' **[REPRESENTANTE]**' : ''}`
                ))
                .join('\n'),
        });
        const adminGuilds = memberDocs.filter(doc => (doc.admin && !doc._id.equals(doc.guild.owner)));
        if(adminGuilds.length) embed.addFields({
            name: 'Administrador',
            value: adminGuilds
                .map(doc => (
                    `[\`${doc.guild.name}\`](https://discord.gg/${doc.guild.invite})` +
                    `${(doc.guild.representative.user === interaction.targetUser.id) ? ' **[REPRESENTANTE]**' : ''}`
                ))
                .join('\n'),
        });
        const modGuilds = memberDocs.filter(doc => !doc.admin);
        if(modGuilds.length) embed.addFields({
            name: 'Moderador',
            value: modGuilds
                .map(doc => (
                    `[\`${doc.guild.name}\`](https://discord.gg/${doc.guild.invite})` +
                    `${(doc.guild.representative.user === interaction.targetUser.id) ? ' **[REPRESENTANTE]**' : ''}`
                ))
                .join('\n'),
        });
        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    }
}

module.exports = new ListstaffsCommand();