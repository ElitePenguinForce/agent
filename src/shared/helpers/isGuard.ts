import type { GuildMember } from "discord.js";
import config from "../../core/config/index.js";

export default function isGuard(member: GuildMember) {
  return member.roles.cache.has(config.ids.roles.guard);
}
