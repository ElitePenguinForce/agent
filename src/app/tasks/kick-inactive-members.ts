import config from "../../core/config/index.js";
import Guild from "../../core/db/models/guild.js";
import createTask from "../../shared/factories/task.js";

export default createTask({
  data: {
    name: "kickInactiveMembers",
    interval: 60 * 60 * 1000,
  },
  execute: async (client) => {
    const now = Date.now();

    const guild = client.guilds.cache.get(config.ids.guild);
    if (!guild) {
      throw new Error("Guild not found");
    }

    const divRole = guild.roles.cache.get(config.ids.roles.guildsDiv);
    if (!divRole) {
      throw new Error("Guilds division role not found");
    }

    await guild.members.fetch();
    const pendingGuilds = await Guild.find({ pending: true });
    for (const member of guild.members.cache
      .filter(
        (member) =>
          !member.user.bot &&
          member.roles.highest.position < divRole.position &&
          member.joinedTimestamp &&
          member.joinedTimestamp < now - 24 * 60 * 60 * 1000 &&
          !pendingGuilds.some((g) => g.representative === member.id),
      )
      .values()) {
      await member.kick();
    }
  },
});
