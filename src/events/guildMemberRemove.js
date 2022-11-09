const { EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
    name: 'guildMemberRemove',
    execute: async (member, client) => {
        const user = member.user ?? await client.users.fetch(member.id);
        const guildModel = require('../models/guild.js');
        await guildModel.updateMany({owner: user.id}, {$set: {owner: null}});
        const memberModel = require('../models/member.js');
        const memberDocs = await memberModel.find({user: user.id}).populate('guild');
        for(const memberDoc of memberDocs.filter(doc => doc.guild.role)){
            const memberCount = await memberModel.countDocuments({guild: memberDoc.guild._id});
            if(memberCount <= config.membersForRole){
                await client.guilds.cache.get(config.guild).roles.delete(memberDoc.guild.role);
                await guildModel.findByIdAndUpdate(memberDoc.guild._id, {$set: {role: null}});
            }
        }
        const representingDocs = await guildModel.find({representative: user.id});
        await memberModel.deleteMany({
            user: user.id,
            guild: {$nin: representingDocs.map(doc => doc._id)},
        });
        if(representingDocs.length){
            const embed = new EmbedBuilder()
                .setColor(0x2f3136)
                .setDescription(
                    `${user} \`${user.tag}\` saiu do servidor enquanto representava os servidores: ` +
                    representingDocs.map(doc => `[\`${doc.name}\`](https://discord.gg/${doc.invite})`).join(' ')
                );
            await client.channels.cache.get(config.logs).send({embeds: [embed]});
        }
    },
};