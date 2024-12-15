import Member from "../db/models/member.js";
import config from "../config.js";
import createCommand from "../factories/command.js";

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

    const warnings: string[] = [];

    for (const member of members.values()) {
      const serverRoles = [
        config.ids.roles.mod,
        config.ids.roles.admin,
        config.ids.roles.owner,
      ];

      if (member.roles.cache.hasAny(...serverRoles)) {
        const userDocs = memberDocs.filter((doc) => doc.user === member.id);
        if (!userDocs.length) {
          warnings.push(
            `**<@${member.id}> (${member.id})** have a moderator/admin/owner role but is not in any server!`,
          );
        }
      }

      if (member.roles.cache.has(config.ids.roles.guest)) {
        warnings.push(`**<@${member.id}> (${member.id})** is a guest!`);
      }
    }

    // i'm praying that this content doesn't reach the discord limit
    return interaction.editReply({
      content: warnings.join("\n") || "Nenhum membro com problemas encontrado!",
    });
  },
});
