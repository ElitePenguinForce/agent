const { SlashCommandBuilder, PermissionsBitField, SlashCommandStringOption } = require("discord.js");
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
                .setNameLocalization('pt-BR', 'novoconvite')
                .setDescription('O novo convite para o servidor')
                .setRequired(true),
            ),
        });
    }

    async execute(interaction, client) {
        const guildModel = require('../models/guild.js');
        const guildId = interaction.options.getString('server');
        const guild = await guildModel.findById({ _id: guildId });

        if (!guild) 
        return interaction.reply({
            content: 'Servidor não encontrado ou removido... ID não está cadastrado no sistema',
            ephemeral: true,
        })
        
        //Uma verificação simples para ver se o usuário é representante da equipe, isto serve para quando
        //o comando falhar no passado e o usuário tentar chamá-lo novamente não sendo o representante no presente
        if (guild.representative !== interaction.user.id) 
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

            await guildModel.findByIdAndUpdate(guildId, {
                invite: invite.code,
                name: invite?.guild.name ?? guild.name,
            });

            return await interaction.reply({
                content: `Convite do servidor \`${guild.name}\` alterado com sucesso! Novo convite: ${invite.url}`,
            });
        }, async () => {
            //Aqui é feita a verificação se o convite é válido, se não for, retornaremos uma mensagem de erro
            await interaction.reply({ content: 'Convite inválido... Tente novamente', ephemeral: true })
        });
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

module.exports = ChangeInviteCommand;