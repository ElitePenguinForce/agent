import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import Guild from "../../../core/db/models/guild.js";
import Member from "../../../core/db/models/member.js";
import createCommand from "../../../shared/factories/commands/index.js";

export default createCommand({
  data: {
    name: "staff",
    description: "Mostra todos os membros da staff desse servidor presentes",
    dmPermission: false,
    defaultMemberPermissions: ["ViewChannel"],
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: "server",
        description: "O servidor que você quer listar",
        required: true,
        autocomplete: true,
      },
    ],
  },
  execute: async (interaction) => {
    const guildId = interaction.options.getString("server", true);

    const members = await Member.find({ guild: guildId });
    if (members.length === 0) {
      return interaction.reply({
        content: "Não há membros da staff nesse servidor",
        ephemeral: true,
      });
    }

    const guild = await Guild.findOne({ _id: guildId, pending: { $ne: true } });
    if (!guild) {
      return interaction.reply({
        content: "Servidor não encontrado",
        ephemeral: true,
      });
    }

    let description = `Representante: <@${guild.representative}>\n`;

    if (guild.owner) {
      description += `Dono: <@${guild.owner}>\n`;
    }

    if (guild.role) {
      description += `Cargo: <@&${guild.role}>\n`;
    }

    const invite = await interaction.client
      .fetchInvite(guild.invite)
      .catch(() => null);
    const embed = new EmbedBuilder()
      .setColor(0x2f3136)
      .setAuthor({
        name: `Staff de ${guild.name}`,
        iconURL: invite?.guild?.iconURL({ extension: "gif" }) ?? undefined,
        url: invite?.url ?? undefined,
      })
      .setDescription(description);

    const admins = members.filter((member) => member.admin);
    if (admins.length) {
      embed.addFields({
        name: "Administradores",
        value: admins.map((admin) => `<@${admin.user}>`).join("\n"),
      });
    }

    const moderators = members.filter((member) => !member.admin);
    if (moderators.length) {
      embed.addFields({
        name: "Moderadores",
        value: moderators.map((moderator) => `<@${moderator.user}>`).join("\n"),
      });
    }

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
});
