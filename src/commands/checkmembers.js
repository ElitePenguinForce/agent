const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const Command = require("../structures/command.js");
const config = require("../config.js");

class CheckMembersCommand extends Command {
  constructor() {
    super({
        active: true,
      data: new SlashCommandBuilder()
        .setName("checkmembers")
        .setDescription("Faça um checkup de todos os membros do servidor.")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
    });
  }

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const memberModel = require("../models/member.js");
    const memberDocs = await memberModel.find({});

    // @vitoUwu: how tf are we suposed to paginate this? skill issue asf
    // remember to update this code when we achieve more than 1000 members
    const members = await interaction.guild.members.fetch({ limit: 1000 });
    const warnings = [];

    for (const [id, member] of members) {
      if (member.roles.cache.hasAny(...config.levels)) {
        const userDocs = memberDocs.filter((doc) => doc.user === id);
        if (!userDocs.length) {
          warnings.push(
            `**<@${id}> (${id})** have a moderator/admin/owner role but is not in any server!`,
          );
        }
      }

      if (member.roles.cache.has(config.guestRole)) {
        warnings.push(
          `**<@${id}> (${id})** is a guest!`,
        );
      }
    }

    // i'm praying that this content doesn't reach the discord limit
    await interaction.editReply({
      content: warnings.join("\n"),
    });
  }
}

module.exports = new CheckMembersCommand();
