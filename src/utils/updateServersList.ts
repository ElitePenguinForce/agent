import { ChannelType, type Client, EmbedBuilder } from "discord.js";
import Constants from "../db/models/constants.js";
import Guild from "../db/models/guild.js";
import config from "../config.js";

const ALMOST_TWO_WEEKS = 1209540000;
const ALPHABET = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

export default async function updateServerList(client: Client) {
  await Constants.updateConstants({
    updatingGuildsChannel: true,
    lastGuildsChannelUpdate: new Date(),
  });

  const channel = client.channels.cache.get(config.ids.channels.serversList);
  if (channel?.type !== ChannelType.GuildText) {
    throw new Error("Server list channel is not guild text");
  }

  const messages = await channel.messages.fetch();
  const lastMessageTimestamp = messages.last()?.createdTimestamp;

  if (
    lastMessageTimestamp &&
    lastMessageTimestamp > Date.now() - ALMOST_TWO_WEEKS
  ) {
    await channel.bulkDelete(100);
  } else {
    for (const message of messages.values()) {
      await message.delete();
    }
  }

  let guildCount = 0;
  for (const letter of ALPHABET) {
    const guildDocs = await Guild.find({
      name: { $regex: new RegExp(`^[^a-z]*${letter}`, "i") },
      pending: { $ne: true },
    });

    if (!guildDocs.length) {
      continue;
    }

    guildCount += guildDocs.length;

    const embed = new EmbedBuilder()
      .setTitle(`Comunidades (${letter})`)
      .setImage(
        `https://cdn.discordapp.com/attachments/946097024804212777/1037824425191542845/Divisoria.png`,
      )
      .setColor(0x5765f0)
      .setDescription(
        guildDocs
          .map((doc) => {
            let str = `[\`${doc.name.replaceAll(
              "`",
              "ˋ",
            )}\`](https://discord.gg/${doc.invite})`;
            return doc.role ? `${str} | <@&${doc.role}>` : str;
          })
          .join("\n"),
      );
    await channel.send({ embeds: [embed] });
  }

  await channel.setTopic(`🧭 | **${guildCount} servidores associados.**`);
  await Constants.updateConstants({ updatingGuildsChannel: false });
}
