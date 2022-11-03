const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, escapeMarkdown } = require('discord.js');
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
        await interaction.deferReply({ephemeral: true});
        const messages = await channel.messages.fetch();
        const minute = 60 * 1000;
        if(messages.last().createdTimestamp > (Date.now() - ((2 * 7 * 24 * 60 * minute) - minute))){
            await channel.bulkDelete(100);
        }
        else{
            for(const message of messages.values()) await message.delete();
        }
        const guildModel = require('../models/guild.js');
        let guildCount = 0;
        for(let i = 65; i < 91; i++){
            const letter = String.fromCharCode(i);
            const guildDocs = await guildModel.find({
                name: {$regex: new RegExp(`^[^a-z]*${letter}`, 'i')},
                pending: {$ne: true},
            });
            if(!guildDocs.length) continue;
            guildCount += guildDocs.length;
            const embed = new EmbedBuilder()
                .setTitle(`Comunidades (${letter})`)
                .setBanner(`https://cdn.discordapp.com/attachments/946097024804212777/1037824425191542845/Divisoria.png`)
                .setColor(0x5765f0)
                .setDescription(
                    guildDocs
                        .map(doc => {
                            let str = `[\`${doc.name.replaceAll('`', 'ˋ')}\`](https://discord.gg/${doc.invite})`;
                            return doc.role ? `${str} | <@&${doc.role}>` : str;
                        })
                        .join('\n'),
                );
            await channel.send({embeds: [embed]});
        }
        await channel.setTopic(`<:icons_discover:859429432535023666>  | **${guildCount} servidores associados.**`);
        await interaction.editReply('Lista de servidores atualizada');
    }
}

module.exports = new UpdateserversCommand()