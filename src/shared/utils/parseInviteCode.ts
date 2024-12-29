import { DISCORD_INVITE_PATTERN } from "../constants";

export default function parseInviteCode(invite: string) {
  return DISCORD_INVITE_PATTERN.exec(invite)?.[1] || invite;
}