const {
    SlashCommandBuilder,
    PermissionsBitField,
    SlashCommandStringOption,
    SlashCommandUserOption,
} = require('discord.js');
const Command = require('../structures/command.js');
const config = require('../config.js');

class RepresentativeCommand extends Command{
    constructor(){
        super({
            active: true,
            data: new SlashCommandBuilder()
                .setName('representative')
                .setNameLocalization('pt-BR', 'representante')
                .setDescription('Define manualmente o representante de um servidor')
                .setDMPermission(false)
                .setDefaultMemberPermissions(PermissionsBitField.Flags.ViewChannel)
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName('server')
                        .setNameLocalization('pt-BR', 'servidor')
                        .setDescription('O servidor para definir um representante')
                        .setAutocomplete(true)
                        .setRequired(true),
                )
                .addUserOption(
                    new SlashCommandUserOption()
                        .setName('representative')
                        .setNameLocalization('pt-BR', 'representante')
                        .setDescription('O usuário que será o representante do servidor')
                        .setRequired(true),
                ),
        });
    }

    async execute(interaction){
        const member = interaction.options.getMember('representative');
        if(!member) return await interaction.reply({
            content: 'Membro não encontrado',
            ephemeral: true,
        });
        const guildModel = require('../models/guild.js');
        const guildId = interaction.options.getString('server');
        const guildDoc = await guildModel.findById(guildId);
        if(!guildDoc) return await interaction.reply({
            content: 'Servidor não encontrado no banco de dados',
            ephemeral: true,
        });
        if((guildDoc.representative !== interaction.user.id) && !interaction.member.roles.cache.has(config.guard)){
            return await interaction.reply({
                content: 'Apenas o representante desse servidor pode definir um novo representante',
                ephemeral: true,
            });
        }
        const memberModel = require('../models/member.js');
        const memberExists = await memberModel.exists({
            user: member.id,
            guild: guildId,
        });
        if(!memberExists) return await interaction.reply({
            content: 'Esse membro não faz parte da staff desse servidor',
            ephemeral: true,
        });
        guildDoc.representative = member.id;
        await guildDoc.save();
        await interaction.reply(
            `${member} definido como representante de [\`${guildDoc.name}\`](https://discord.gg/${guildDoc.invite})`
        );
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

module.exports = new RepresentativeCommand();