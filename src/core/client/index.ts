import { GatewayIntentBits, Partials } from "discord.js";
import Agent from "./Client.js";

export default new Agent({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  partials: [Partials.GuildMember, Partials.Channel],
  allowedMentions: { repliedUser: false },
});
