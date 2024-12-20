const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const Command = require("../structures/command.js");
const config = require("../config.js");
const constants = require("../utils/constants.js");

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
          const warning = `**<@${id}> (${id})** have a moderator/admin/owner role but is not in any server!`;
          if (warnings.at(-1).length + warning.length < constants.maxMessageContentLength) {
            warnings[warnings.length - 1] += `\n${warning}`;
          } else {
            warnings.push(warning);
          }
        }
      }

      if (member.roles.cache.has(config.guestRole)) {
        const warning = `**<@${id}> (${id})** is a guest!`;
        if (warnings.at(-1).length + warning.length < constants.maxMessageContentLength) {
          warnings[warnings.length - 1] += `\n${warning}`;
        } else {
          warnings.push(warning);
        }
      }
    }

    for (const [index, warning] of warnings.entries()) {
      const reply = index === 0 ? interaction.editReply : interaction.followUp;
      
      await reply({
        content: warning,
      });
    }
  }
}

module.exports = new CheckMembersCommand();
