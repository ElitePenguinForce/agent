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

import { EmbedBuilder } from "discord.js";
import config from "../../config.js";
import Guild from "../../db/models/guild.js";
import Member, {
  type GuildPopulatedMemberSchemaType,
} from "../../db/models/member.js";
import createEvent from "../../factories/event.js";

export default createEvent({
  name: "guildMemberRemove",
  execute: async (member) => {
    await Guild.updateMany({ owner: member.id }, { $set: { owner: null } });

    const memberDocs = await Member.find<GuildPopulatedMemberSchemaType>({
      user: member.id,
    }).populate("guild");
    for (const memberDoc of memberDocs.filter((doc) => doc.guild.role)) {
      const memberCount = await Member.countDocuments({
        guild: memberDoc.guild._id,
      });
      if (memberCount <= config.minMembersToCreateGuildRole) {
        await member.guild.roles.delete(memberDoc.guild.role!);
        await Guild.updateOne(
          { _id: memberDoc.guild._id },
          { $set: { role: null } },
        );
        member.client.updateServersData([
          `<:mod:1040429385066491946> **|** O servidor **${memberDoc.guild.name}** perdeu o seu cargo.`,
        ]);
      }
    }

    await Member.deleteMany({ user: member.id });

    const representingDocs = await Guild.find({ representative: member.id });
    await Guild.updateMany(
      { representative: member.id },
      { $set: { representative: config.ids.agent } },
    );

    if (representingDocs.length) {
      const embed = new EmbedBuilder()
        .setColor(0x2f3136)
        .setDescription(
          `${member} \`${member.user.username}\` saiu do servidor enquanto representava os servidores: ` +
            representingDocs
              .map(
                (doc) => `[\`${doc.name}\`](https://discord.gg/${doc.invite})`,
              )
              .join(" "),
        );

      const channel = member.client.channels.cache.get(
        config.ids.channels.changeLog,
      );
      if (!channel?.isSendable()) {
        return;
      }

      await channel.send({ embeds: [embed] });
    }
  },
});
