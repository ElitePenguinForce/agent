const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const config = require('../config.js');
const Command = require('../structures/command.js');

class UpdateserversCommand extends Command{
    constructor(){
        super({
            active: true,
            data: new SlashCommandBuilder()
                .setName('updateservers')
                .setNameLocalization('pt-BR', 'atualizarservidores')
                .setDescription('Atualiza a lista de servidores que fazem parte da EPF')
                .setDMPermission(true)
                .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles),
        });
    }

    async execute(interaction, client){
        const channel = client.channels.cache.get(config.serversChannel);
        const messages = await channel.messages.fetch({limite: 100});
        for(const message of messages.values()) await message.delete();
        const guildModel = require('../models/guild.js');
        for(let i = 0; i < 26; i++){
            const letter = String.fromCharCode(65 + i);
            const guildDocs = await guildModel.find({
                name: {$regex: new RegExp(`^${letter}`, 'i')},
                pending: {$ne: true},
            });
            if(!guildDocs.length) continue;
            const embed = new EmbedBuilder()
                .setTitle(`Comunidades (${letter})`)
                .setColor(0x2f3136)
                .setDescription(
                    guildDocs
                        .map(doc => `[\`${doc.name}\`](https://discord.gg/${doc.invite}) | <@&${doc.role}>`)
                        .join('\n'),
                );
            await channel.send({embeds: [embed]});
        }
        await interaction.reply({
            content: 'Lista de servidores atualizada',
            ephemeral: true,
        });
    }
}

module.exports = new UpdateserversCommand()