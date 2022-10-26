const { SlashCommandBuilder, PermissionsBitField, SlashCommandStringOption, SlashCommandUserOption, SlashCommandIntegerOption } = require("discord.js");

module.exports = {
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
                .setMinLength(17)
                .setMaxLength(19)
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
                        name: 'Dono (posse)',
                        value: 2,
                    },
                ),
        ),
    execute: async (interaction, client) => {

    },
};