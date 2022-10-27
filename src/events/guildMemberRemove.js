const { EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
    name: 'guildMemberRemove',
    execute: async (member, client) => {
        const guildModel = require('../models/guild.js');
        await guildModel.updateMany({owner: member.id}, {$set: {owner: null}});
        const memberModel = require('../models/member.js');
        const memberDocs = await memberModel.find({user: member.id}).populate('guild');
        for(const memberDoc of memberDocs.filter(doc => doc.guild.role)){
            const memberCount = await memberModel.countDocuments({guild: memberDoc.guild._id});
            if(memberCount <= 5){
                await guildModel.findByIdAndUpdate(memberDoc.guild._id, {$set: {role: null}});
                await member.guild.roles.delete(memberDoc.guild.role);
            }
        }
        await memberModel.deleteMany({user: member.id});
        const representingDocs = await guildModel.find({representative: member.id});
        if(representingDocs.length){
            const embed = new EmbedBuilder()
                .setColor(0x2f3136)
                .setDescription(
                    `${member.user.tag} saiu do servidor enquanto representava os servidores: ` +
                    representingDocs.map(doc => `[\`${doc.name}\`](https://discord.gg/${doc.invite})`).join(' ')
                );
            await client.channels.cache.get(config.logs).send({embeds: [embed]});
        }
    },
};