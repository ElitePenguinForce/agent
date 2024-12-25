import { EmbedBuilder } from "discord.js";
import Member, {
  type GuildPopulatedMemberSchemaType,
} from "../../../../core/db/models/member.js";
import createUserContext from "../../../../shared/factories/user-context.js";

export default createUserContext({
  data: {
    name: "liststaffs",
    nameLocalizations: {
      "pt-BR": "Listar Staffs",
      "en-US": "List Staffs",
      "en-GB": "List Staffs",
    },
    dmPermission: false,
    defaultMemberPermissions: ["ViewChannel"],
  },
  async execute(interaction) {
    const user = interaction.targetUser;
    const memberDocs = await Member.find<GuildPopulatedMemberSchemaType>({
      user: user.id,
    }).populate("guild");

    if (!memberDocs.length) {
      return interaction.reply({
        content: "O usuário não faz parte de nenhuma staff!",
      });
    }

    const embed = new EmbedBuilder().setColor(0x2f3136).setAuthor({
      name: `Staffs que ${user.displayName} faz parte`,
      iconURL: user.avatarURL({ extension: "gif" }) || "",
    });

    const ownedGuilds = memberDocs.filter(
      (doc) => doc.user === doc.guild.owner && doc.guild.pending !== true,
    );

    if (ownedGuilds.length) {
      embed.addFields({
        name: "Dono de",
        value: ownedGuilds
          .map(
            (doc) =>
              `[\`${doc.guild.name}\`](https://discord.gg/${doc.guild.invite})` +
              `${
                doc.guild.representative === interaction.targetUser.id
                  ? " **[REPRESENTANTE]**"
                  : ""
              }`,
          )
          .join("\n"),
      });
    }

    const adminGuilds = memberDocs.filter(
      (doc) =>
        doc.admin && doc.user !== doc.guild.owner && doc.guild.pending !== true,
    );
    if (adminGuilds.length) {
      embed.addFields({
        name: "Administra",
        value: adminGuilds
          .map(
            (doc) =>
              `[\`${doc.guild.name}\`](https://discord.gg/${doc.guild.invite})` +
              `${
                doc.guild.representative === interaction.targetUser.id
                  ? " **[REPRESENTANTE]**"
                  : ""
              }`,
          )
          .join("\n"),
      });
    }

    const modGuilds = memberDocs.filter(
      (doc) => !doc.admin && doc.guild.pending !== true,
    );
    if (modGuilds.length) {
      embed.addFields({
        name: "Modera",
        value: modGuilds
          .map(
            (doc) =>
              `[\`${doc.guild.name}\`](https://discord.gg/${doc.guild.invite})` +
              `${
                doc.guild.representative === interaction.targetUser.id
                  ? " **[REPRESENTANTE]**"
                  : ""
              }`,
          )
          .join("\n"),
      });
    }

    return interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
});
