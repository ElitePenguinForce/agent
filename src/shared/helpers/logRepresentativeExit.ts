import { type GuildMember, type PartialGuildMember } from "discord.js";
import config from "../../core/config/index.js";
import type { GuildSchemaType } from "../../core/db/models/guild.js";
import createColorlessEmbed from "../factories/embeds/colorless.js";

type Options = {
  member: GuildMember | PartialGuildMember;
  representingDocs: GuildSchemaType[];
};

/**
 * Logs when a member leaves a guild while representing another guild
 *
 * @param options The options to log the representative exit
 */
export default function logRepresentativeExit(options: Options) {
  const { member, representingDocs } = options;

  const embed = createColorlessEmbed({
    description:
      `\`${member.user.username}\` saiu do servidor enquanto representava os servidores: ` +
      representingDocs
        .map((doc) => `[\`${doc.name}\`](https://discord.gg/${doc.invite})`)
        .join(" "),
  });

  const channel = member.client.channels.cache.get(
    config.ids.channels.changeLog,
  );

  if (!channel?.isSendable()) {
    console.error(
      `[logRepresentativeExit] Channel ${config.ids.channels.changeLog} is not sendable`,
    );
    return;
  }

  return channel.send({ embeds: [embed] });
}
