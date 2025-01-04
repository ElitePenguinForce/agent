import type { Guild as DiscordGuild } from "discord.js";
import Guild from "../../core/db/models/guild.js";

type Options = {
  guild: DiscordGuild;
  roleId: string;
};

/**
 * Deletes a guild role and updates the guild's role in the database
 *
 * @param options The options to delete the guild role
 */
export default async function deleteGuildRole(options: Options) {
  const { guild, roleId } = options;

  await guild.roles.delete(roleId);
  await Guild.updateOne({ _id: guild.id }, { $set: { role: null } });

  guild.client.updateServersData([
    `<:mod:1040429385066491946> **|** O servidor **${guild.name}** perdeu o seu cargo.`,
  ]);
}
