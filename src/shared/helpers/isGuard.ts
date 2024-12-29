import { type APIGuildMember, GuildMember } from "discord.js";
import config from "../../core/config/index.js";

export default function isGuard(member: GuildMember | APIGuildMember) {
  if (member instanceof GuildMember) {
    return member.roles.cache.has(config.ids.roles.guard);
  }

  return member.roles.includes(config.ids.roles.guard);
}
