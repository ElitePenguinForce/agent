// Copyright (C) 2022  HordLawk & vitoUwu & PeterStark000

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
                client.emit('updateGuilds', false)
            }
        }
        await memberModel.deleteMany({user: user.id});
        const representingDocs = await guildModel.find({representative: user.id});
        await guildModel.updateMany({representative: user.id}, {$set: {representative: config.agent}});
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