import { ChannelType, type Client } from "discord.js";
import config from "../../core/config/index.js";
import Constants from "../../core/db/models/constants.js";

export default async function sendChangeLogs(client: Client) {
  const constants = await Constants.getConstants();
  if (!constants.updateLogs.length) {
    return;
  }

  const channel = client.channels.cache.get(config.ids.channels.changeLog);
  if (channel?.type !== ChannelType.GuildText) {
    throw new Error("Change log channel is not a text channel");
  }

  await channel.send({
    content: constants.updateLogs.join("\n"),
    allowedMentions: { roles: [], users: [] },
  });

  constants.updateLogs = [];
  await constants.save();
}
