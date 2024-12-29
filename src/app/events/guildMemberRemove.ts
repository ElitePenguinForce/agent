import config from "../../core/config/index.js";
import Guild from "../../core/db/models/guild.js";
import Member, {
  type GuildPopulatedMemberSchemaType,
} from "../../core/db/models/member.js";
import createEvent from "../../shared/factories/event.js";
import deleteGuildRole from "../../shared/helpers/deleteGuildRole.js";
import logRepresentativeExit from "../../shared/helpers/logRepresentativeExit.js";

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

      if (
        memberCount <= config.minMembersToCreateGuildRole &&
        memberDoc.guild.role
      ) {
        await deleteGuildRole({
          guild: member.guild,
          roleId: memberDoc.guild.role,
        });
      }
    }

    await Member.deleteMany({ user: member.id });

    const representingDocs = await Guild.find({ representative: member.id });
    await Guild.updateMany(
      { representative: member.id },
      { $set: { representative: config.ids.agent } },
    );

    if (representingDocs.length) {
      await logRepresentativeExit({ member, representingDocs });
    }
  },
});
