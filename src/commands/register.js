const { SlashCommandBuilder, PermissionsBitField, SlashCommandStringOption, SlashCommandUserOption, SlashCommandIntegerOption } = require("discord.js");
const Command = require('../structures/command.js');

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
        if(await memberModel.findOne({
            user: member.id,
            guild: guildId,
        })) return await interaction.reply({
            content: 'Esse usuário já está registrado nesse servidor',
            ephemeral: true,
        });
        const guildDoc = await guildModel.findOne({
            _id: guildId,
            representative: interaction.user.id,
        }).populate('owner');
        if(!guildDoc) return await interaction.reply({
            content: 'Servidor não cadastrado no banco de dados',
            ephemeral: true,
        });
        const level = interaction.options.getInteger('role');
        const memberDoc = new memberModel({
            user: member.id,
            guild: guildId,
            admin: !!level,
        });
        if(level === 2){
            if(guildDoc.owner) return await interaction.reply({
                content: `O dono desse servidor já está cadastrado como <@${guildDoc.owner.user}>`,
                ephemeral: true,
            });
            await memberDoc.save();
            guildDoc.owner = memberDoc._id;
            await guildDoc.save();
        }
        else{
            await memberDoc.save();
        }
        await interaction.reply({
            content: `${member} registrado em [${guildDoc.name}](https://discord.gg/${guildDoc.invite}) com sucesso`,
            ephemeral: true,
        });
        const invite = await client.fetchInvite(guildDoc.invite).catch(() => null);
        if(invite){
            if(invite.guild){
                guildDoc.name = invite.guild.name;
                await guildDoc.save();
            }
        }
        else{
            await interaction.followUp({
                content: 'Por favor adicione um convite válido para o seu servidor utilizando [comando]',
                ephemeral: true,
            });
        }
        const memberCount = await memberModel.countDocuments({guild: guildId});
        if(memberCount >= 5){
            let role;
            if(guildDoc.role){
                role = interaction.guild.roles.cache.get(guildDoc.role);
            }
            else{
                role = await interaction.guild.roles.create({
                    name: guildDoc.name,
                    mentionable: true,
                });
                guildDoc.role = role.id;
                await guildDoc.save();
            }
            await member.roles.add(role);
        }
        else if(guildDoc.role){
            await interaction.guild.roles.delete(guildDoc.role);
            guildDoc.role = null;
            await guildDoc.save();
        }
    }

    async autocomplete$server(interaction, value){
        const guildModel = require('../models/guild.js');
        const representing = await guildModel.find({
            representative: interaction.user.id,
            name: {$regex: new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')},
        });
        return representing.map(guildDoc => ({
            name: guildDoc.name,
            value: guildDoc._id,
        }));
    }
}

module.exports = new RegisterCommand();