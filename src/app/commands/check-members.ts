import config from "../../core/config/index.js";
import Member from "../../core/db/models/member.js";
import { MAX_MESSAGE_CONTENT_LENGTH } from "../../shared/constants.js";
import createCommand from "../../shared/factories/commands/index.js";
import { ChunkedString } from "../../shared/helpers/ChunkedString.js";

export default createCommand({
  data: {
    name: "checkmembers",
    description: "Faça um checkup de todos os membros do servidor.",
    dmPermission: false,
    defaultMemberPermissions: ["Administrator"],
  },
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const memberDocs = await Member.find({});
    const members = await interaction.guild.members.fetch({
      limit: 1000,
    });

    const warnings = new ChunkedString(MAX_MESSAGE_CONTENT_LENGTH);

    for (const member of members.values()) {
      const serverRoles = [
        config.ids.roles.mod,
        config.ids.roles.admin,
        config.ids.roles.owner,
      ];

      if (member.roles.cache.hasAny(...serverRoles)) {
        const userDocs = memberDocs.filter((doc) => doc.user === member.id);
        if (!userDocs.length) {
          warnings.addLine(
            `**<@${member.id}> (${member.id})** have a moderator/admin/owner role but is not in any server!`,
          );
        }
      }

      if (member.roles.cache.has(config.ids.roles.guest)) {
        warnings.addLine(`**<@${member.id}> (${member.id})** is a guest!`);
      }
    }

    for (const [index, warning] of warnings.get().entries()) {
      const reply = index === 0 ? interaction.editReply : interaction.followUp;

      await reply({
        content: warning || "Nenhum membro com problemas encontrado!",
      });
    }
  },
});
