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
        console.log(interaction.options.data);
        await interaction.reply({
            content: 'test',
            ephemeral: true,
        });
    }

    async autocomplete$server(interaction, value){
        const guildModel = require('../models/guild.js');
        const representing = await guildModel.find({
            representative: interaction.user.id,
            name: {$regex: new RegExp(value, 'i')},
        });
        return representing.map(guildDoc => ({
            name: guildDoc.name,
            value: guildDoc._id,
        }));
    }
}

module.exports = new RegisterCommand();