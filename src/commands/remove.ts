import { ApplicationCommandOptionType } from "discord.js";
import Guild from "../db/models/guild.js";
import Member, {
  type GuildPopulatedMemberSchemaType,
} from "../db/models/member.js";
import config from "../config.js";
import isGuard from "../utils/isGuard.js";
import createCommand from "../factories/command.js";

export default createCommand({
  data: {
    name: "remove",
    description: "Remove um membro de uma staff",
    dmPermission: false,
    defaultMemberPermissions: ["ViewChannel"],
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: "member",
        description: "O membro que deve ser removido dessa equipe",
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: "server",
        description: "De qual das suas equipes esse membro deve ser removido",
        autocomplete: true,
        required: true,
      },
    ],
  },
  async execute(interaction) {
    const member = interaction.options.getMember("member");
    if (!member) {
      return await interaction.reply({
        content: "Membro não encontrado",
        ephemeral: true,
      });
    }
    const guildId = interaction.options.getString("server");
    const guildDoc = await Guild.findById(guildId);
    if (!guildDoc) {
      return interaction.reply({
        content: "Servidor não cadastrado no banco de dados",
        ephemeral: true,
      });
    }
    if (guildDoc.representative === interaction.user.id) {
      if (member.id === interaction.user.id) {
        return interaction.reply({
          content:
            "Você não pode se remover de um servidor que você representa",
          ephemeral: true,
        });
      }
    } else if (!isGuard(interaction.member)) {
      return await interaction.reply({
        content:
          "Apenas o representante desse servidor pode remover membros da staff",
        ephemeral: true,
      });
    }
    const memberDoc = await Member.findOneAndDelete({
      user: member.id,
      guild: guildId,
    });
    if (!memberDoc) {
      return await interaction.reply({
        content: "Esse membro não pertence a staff desse servidor",
        ephemeral: true,
      });
    }
    if (guildDoc.owner === member.id) {
      guildDoc.owner = null;
      await guildDoc.save();
      const ownedGuildExists = await Guild.exists({
        owner: member.id,
        pending: {
          $ne: true,
        },
      });
      if (!ownedGuildExists) {
        await member.roles.remove(config.ids.roles.owner);
      }
    } else if (memberDoc.admin) {
      const adminStaffs = await Member.find<GuildPopulatedMemberSchemaType>({
        user: member.id,
        admin: true,
      }).populate("guild");
      const isStillAdmin = adminStaffs.some(
        (doc) => doc.guild.pending !== true,
      );
      if (!isStillAdmin) {
        await member.roles.remove(config.ids.roles.admin);
      }
    } else {
      const modStaffs = await Member.find<GuildPopulatedMemberSchemaType>({
        user: member.id,
        admin: {
          $ne: true,
        },
      }).populate("guild");
      const isStillMod = modStaffs.some((doc) => doc.guild.pending !== true);
      if (!isStillMod) {
        await member.roles.remove(config.ids.roles.mod);
      }
    }
    await interaction.reply(
      `${member} removido de [${guildDoc.name}](https://discord.gg/${guildDoc.invite}) com sucesso`,
    );
    const updates: string[] = [];
    const invite = await interaction.client
      .fetchInvite(guildDoc.invite)
      .catch(() => null);
    if (invite) {
      if (invite.guild && guildDoc.name !== invite.guild.name) {
        updates.push(
          `<:icon_guild:1037801942149242926> **|** Nome de servidor alterado: **${guildDoc.name}** -> **${invite.guild.name}**`,
        );
        guildDoc.name = invite.guild.name;
        await guildDoc.save();
        if (guildDoc.role) {
          await interaction.guild.roles.cache
            .get(guildDoc.role)
            ?.setName(invite.guild.name);
        }
      }
    } else {
      await interaction.followUp({
        content:
          `Por favor adicione um convite válido para o seu servidor utilizando ` +
          `</changeinvite:${
            interaction.guild.commands.cache.find(
              (cmd) => cmd.name === "changeinvite",
            )?.id
          }>`,
        ephemeral: true,
      });
    }
    if (guildDoc.role) {
      await member.roles.remove(guildDoc.role);
      const memberCount = await Member.countDocuments({ guild: guildId });
      if (memberCount < config.minMembersToCreateGuildRole) {
        await interaction.guild.roles.delete(guildDoc.role);
        guildDoc.role = null;
        await guildDoc.save();
        updates.push(
          `<:mod:1040429385066491946> **|** O servidor **${guildDoc.name}** perdeu o seu cargo.`,
        );
      }
    }

    if (updates.length) {
      interaction.client.updateServersData(updates);
    }
  },
});
