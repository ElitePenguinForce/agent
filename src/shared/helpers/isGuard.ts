import { type APIGuildMember, GuildMember } from "discord.js";
import config from "../../core/config/index.js";

/**
 * Checks if a member is a guard
 *
 * @param member The member to check
 * @returns Whether the member is a guard
 */
export default function isGuard(member: GuildMember | APIGuildMember) {
  if (member instanceof GuildMember) {
    return member.roles.cache.has(config.ids.roles.guard);
  }

  return member.roles.includes(config.ids.roles.guard);
}
