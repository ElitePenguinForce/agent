const {
    SlashCommandBuilder,
    PermissionsBitField,
    SlashCommandUserOption,
    SlashCommandStringOption,
} = require('discord.js');
const Command = require('../structures/command.js');
const config = require('../config.js');

class RemoveCommand extends Command{
    constructor(){
        super({
            active: true,
            data: new SlashCommandBuilder()
                .setName('remove')
                .setNameLocalization('pt-BR', 'remover')
                .setDescription('Remove um membro de uma staff')
                .setDMPermission(false)
                .setDefaultMemberPermissions(PermissionsBitField.Flags.ViewChannel)
                .addUserOption(
                    new SlashCommandUserOption()
                        .setName('member')
                        .setNameLocalization('pt-BR', 'membro')
                        .setDescription('O membro que deve ser removido dessa equipe')
                        .setRequired(true),
                )
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName('server')
                        .setNameLocalization('pt-BR', 'servidor')
                        .setDescription('De qual das suas equipes esse membro deve ser removido')
                        .setAutocomplete(true)
                        .setRequired(true),
                )
        });
    }

    async execute(interaction, client){
        const guildModel = require('../models/guild.js');
        const memberModel = require('../models/member.js');
        const member = interaction.options.getMember('member');
        if(!member) return await interaction.reply({
            content: 'Membro não encontrado no servidor',
            ephemeral: true,
        });
        const guildId = interaction.options.getString('server');
        const guildDoc = await guildModel.findById(guildId);
        if(!guildDoc) return await interaction.reply({
            content: 'Servidor não cadastrado no banco de dados',
            ephemeral: true,
        });
        if(guildDoc.representative === interaction.user.id){
            if(member.id === interaction.user.id) return await interaction.reply({
                content: 'Você não pode se remover de um servidor que você representa',
                ephemeral: true,
            });
        }
        else if(!interaction.member.roles.cache.has(config.guard)){
            return await interaction.reply({
                content: 'Apenas o representante desse servidor pode adicionar novos membros a staff',
                ephemeral: true,
            });
        }
        const memberDoc = await memberModel.findOneAndDelete({
            user: member.id,
            guild: guildId,
        });
        if(guildDoc.owner === member.id){
            guildDoc.owner = null;
            await guildDoc.save();
            const ownedGuildExists = await guildModel.exists({owner: member.id});
            if(!ownedGuildExists) await member.roles.remove(config.levels[2]);
        }
        else if(memberDoc.admin){
            const adminGuildExists = await memberModel.exists({
                user: member.id,
                admin: true,
            });
            if(!adminGuildExists) await member.roles.remove(config.levels[1]);
        }
        else{
            const modGuildExists = await memberModel.exists({
                user: member.id,
                admin: {$ne: true},
            });
            if(!modGuildExists) await member.roles.remove(config.levels[0]);
        }
        await interaction.reply(
            `${member} removido de [${guildDoc.name}](https://discord.gg/${guildDoc.invite}) com sucesso`
        );
        let needUpdate = false;
        const invite = await client.fetchInvite(guildDoc.invite).catch(() => null);
        if(invite){
            if(invite.guild){
                if (guildDoc.name !== invite.guild.name) needUpdate = true
                guildDoc.name = invite.guild.name;
                await guildDoc.save();
            }
        }
        else{
            await interaction.followUp({
                content: (
                    `Por favor adicione um convite válido para o seu servidor utilizando ` +
                    `</changeinvite:${interaction.guild.commands.cache.find(cmd => (cmd.name === 'changeinvite')).id}>`
                ),
                ephemeral: true,
            });
        }
        if(guildDoc.role){
            await member.roles.remove(guildDoc.role);
            const memberCount = await memberModel.countDocuments({guild: guildId});
            if(memberCount < config.membersForRole){
                await interaction.guild.roles.delete(guildDoc.role);
                guildDoc.role = null;
                await guildDoc.save();
                needUpdate = true;
            }
        }

        if (needUpdate) client.emit('updateGuilds')
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

module.exports = new RemoveCommand();