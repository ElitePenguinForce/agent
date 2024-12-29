import { config } from "seyfert";

export default config.bot({
  token: process.env.DISCORD_TOKEN,
  locations: {
    base: "src",
    commands: "commands",
    events: "events",
    output: "dist"
  },
  intents: ["GuildMembers", "Guilds"],
})