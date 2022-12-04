const {
    SlashCommandBuilder,
    PermissionsBitField,
    SlashCommandStringOption,
    SlashCommandUserOption,
    SlashCommandIntegerOption,
} = require("discord.js");
const Command = require('../structures/command.js');
const config = require('../config.js');

class RegisterCommand extends Command{
    constructor(){
        super({
            active: true,
            data: new SlashCommandBuilder()
                .setName('register')
                .setNameLocalization('pt-BR', 'registrar')
                .setDescription('Adicione um novo membro a uma das suas equipes')
                .setDMPermission(false)
                .setDefaultMemberPermissions(PermissionsBitField.Flags.ViewChannel)
                .addUserOption(
                    new SlashCommandUserOption()
                        .setName('member')
                        .setNameLocalization('pt-BR', 'membro')
                        .setDescription('O membro que deve ser registrado nessa equipe')
                        .setRequired(true),
                )
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName('server')
                        .setNameLocalization('pt-BR', 'servidor')
                        .setDescription('Em qual das suas equipes esse membro deve ser registrado')
                        .setAutocomplete(true)
                        .setRequired(true),
                )
                .addIntegerOption(
                    new SlashCommandIntegerOption()
                        .setName('role')
                        .setNameLocalization('pt-BR', 'cargo')
                        .setDescription('O cargo que esse membro tem nessa equipe')
                        .setRequired(true)
                        .addChoices(
                            {
                                name: 'Moderador',
                                value: 0,
                            },
                            {
                                name: 'Administrador',
                                value: 1,
                            },
                            {
                                name: 'Dono (único)',
                                value: 2,
                            },
                        ),
                ),
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
        if((guildDoc.representative !== interaction.user.id) && !interaction.member.roles.cache.has(config.guard)){
            return await interaction.reply({
                content: 'Apenas o representante desse servidor pode adicionar novos membros a staff',
                ephemeral: true,
            });
        }
        const isOldOwner = (guildDoc.owner === member.id);
        const level = interaction.options.getInteger('role');
        if(level === 2){
            if(guildDoc.owner) return await interaction.reply({
                content: `O dono desse servidor já está cadastrado como <@${guildDoc.owner}>`,
                ephemeral: true,
            });
            guildDoc.owner = member.id;
            await guildDoc.save();
        }
        else if(guildDoc.owner === member.id){
            guildDoc.owner = null;
            await guildDoc.save();
        }
        const oldMemberDoc = await memberModel.findOneAndUpdate({
            user: member.id,
            guild: guildId,
        }, {$set: {admin: !!level}}, {
            upsert: true,
            setDefaultsOnInsert: true,
        });
        if(oldMemberDoc){
            if(isOldOwner){
                const ownedGuildExists = await guildModel.exists({owner: member.id});
                if(!ownedGuildExists) await member.roles.remove(config.levels[2]);
            }
            else if(oldMemberDoc.admin){
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
        }
        await member.roles.add(config.levels[level]);
        await interaction.reply(
            `${member} registrado em [${guildDoc.name}](https://discord.gg/${guildDoc.invite}) com sucesso`
        );
		let updates = [];
		const invite = await client
			.fetchInvite(guildDoc.invite)
			.catch(() => null);
		if (invite) {
			if (invite.guild && guildDoc.name !== invite.guild.name) {
				updates.push(
					`<:icon_guild:1037801942149242926> **|** Nome de servidor alterado: **${guildDoc.name}** -> **${invite.guild.name}**`
				);
                guildDoc.name = invite.guild.name;
                await guildDoc.save();
				if (guildDoc.role)
					await interaction.guild.roles.cache
						.get(guildDoc.role)
						.setName(invite.guild.name);
            }
		} else {
            await interaction.followUp({
                content: (
                    `Por favor adicione um convite válido para o seu servidor utilizando ` +
                    `</changeinvite:${interaction.guild.commands.cache.find(cmd => (cmd.name === 'changeinvite')).id}>`
                ),
                ephemeral: true,
            });
        }
        const memberDocs = await memberModel.find({guild: guildId});
        if(memberDocs.length >= config.membersForRole){
            let role;
            if(guildDoc.role){
                role = interaction.guild.roles.cache.get(guildDoc.role);
            }
            else{
                role = await interaction.guild.roles.create({
                    name: guildDoc.name,
                    mentionable: true,
                    color: 0x607D8B,
                    position: interaction.guild.roles.cache.get(config.serversDivRole).position + 1,
                    permissions: 0n,
                });
                guildDoc.role = role.id;
                await guildDoc.save();
                for(const otherMemberDoc of memberDocs){
                    const otherMember = await interaction.guild.members.fetch(otherMemberDoc.user).catch(() => null);
                    if(otherMember) await otherMember.roles.add(role);
                }
				updates.push(
					`<:mod:1040429385066491946> **|** Cargo para o servidor **${guildDoc.name}** criado`
				);
            }
            await member.roles.add(role);
        }

		if (updates.length) {
			client.emit('updateGuilds', false, updates.join('\n'));
			updates = [];
		}
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

module.exports = new RegisterCommand();