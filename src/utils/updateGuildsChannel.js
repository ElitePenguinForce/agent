const { EmbedBuilder } = require('discord.js')

module.exports = async (client) => {
    const constantsModel = require('../models/constants')
    await constantsModel.updateConstants({ updatingGuildsChannel: true, lastGuildsChannelUpdate: new Date() });
    const config = require('../config')
    const channel = client.channels.cache.get(config.serversChannel);
    const messages = await channel.messages.fetch();
    const minute = 60 * 1000;
    if(messages.last()?.createdTimestamp > (Date.now() - ((2 * 7 * 24 * 60 * minute) - minute))){
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
            .setImage(`https://cdn.discordapp.com/attachments/946097024804212777/1037824425191542845/Divisoria.png`)
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
    await channel.setTopic(`🧭 | **${guildCount} servidores associados.**`);
    await constantsModel.updateConstants({ updatingGuildsChannel: false });
}