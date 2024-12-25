import { ApplicationCommandOptionType, Role } from "discord.js";
import config from "../../../core/config/index.js";
import Guild from "../../../core/db/models/guild.js";
import Member from "../../../core/db/models/member.js";
import createCommand from "../../../shared/factories/commands/index.js";
import type { StaffRole } from "../../../shared/types/index.js";
import isGuard from "../../../shared/helpers/isGuard.js";

export default createCommand({
  data: {
    name: "register",
    description: "Adicione um novo membro a uma das suas equipes",
    dmPermission: false,
    defaultMemberPermissions: ["ViewChannel"],
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: "membro",
        description: "O membro que deve ser registrado nessa equipe",
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: "server",
        description: "Em qual das suas equipes esse membro deve ser registrado",
        required: true,
        autocomplete: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: "cargo",
        description: "O cargo que esse membro tem nessa equipe",
        required: true,
        choices: [
          {
            name: "Moderador",
            value: "mod",
          },
          {
            name: "Administrador",
            value: "admin",
          },
          {
            name: "Dono",
            value: "owner",
          },
        ],
      },
    ],
  },
  async execute(interaction) {
    const member = interaction.options.getMember("membro");
    if (!member) {
      return interaction.reply({
        content: "Membro não encontrado no servidor",
        ephemeral: true,
      });
    }

    if (member.user.bot) {
      return interaction.reply({
        content: "Não é possível adicionar bots a uma equipe",
        ephemeral: true,
      });
    }

    const guildId = interaction.options.getString("server", true);
    const guildDoc = await Guild.findById(guildId);
    if (!guildDoc) {
      return interaction.reply({
        content: "Servidor não encontrado",
        ephemeral: true,
      });
    }

    if (guildDoc.pending) {
      return interaction.reply({
        content: "O servidor ainda não foi aprovado na EPF",
        ephemeral: true,
      });
    }

    if (
      guildDoc.representative !== interaction.user.id &&
      !isGuard(interaction.member)
    ) {
      return interaction.reply({
        content:
          "Apenas o representante desse servicor pode adicionar novos membros na EPF",
      });
    }

    const isOldOwner = guildDoc.representative === member.id;
    const role = interaction.options.getString("cargo", true) as StaffRole;

    if (role === "owner") {
      if (guildDoc.owner) {
        return interaction.reply({
          content: `O dono desse servidor já está cadastrado como <@${guildDoc.owner}>`,
          ephemeral: true,
        });
      }

      guildDoc.owner = member.id;
      await guildDoc.save();
    } else if (guildDoc.owner === member.id) {
      guildDoc.owner = null;
      await guildDoc.save();
    }

    const oldMemberDoc = await Member.findOneAndUpdate(
      {
        guild: guildId,
        user: member.id,
      },
      { $set: { admin: role !== "mod" } },
      { upsert: true, setDefaultsOnInsert: true },
    );

    if (oldMemberDoc) {
      if (isOldOwner) {
        const ownSomeGuild = await Guild.exists({
          owner: member.id,
        });
        if (!ownSomeGuild) {
          member.roles.remove(config.ids.roles.owner);
        }
      } else if (oldMemberDoc.admin) {
        const isAdmin = await Member.exists({
          admin: true,
          user: member.id,
        });
        if (!isAdmin) {
          member.roles.remove(config.ids.roles.admin);
        }
      } else {
        const isMod = await Member.exists({
          admin: { $ne: true },
          user: member.id,
        });
        if (!isMod) {
          member.roles.remove(config.ids.roles.mod);
        }
      }
    }

    await member.roles.add(config.ids.roles[role]);
    await interaction.reply({
      content: `${member} registrado em [${guildDoc.name}](https://discord.gg/${guildDoc.invite}) com sucesso`,
    });

    let updates: string[] = [];
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

    const memberDocs = await Member.find({ guild: guildId });
    if (memberDocs.length > config.minMembersToCreateGuildRole) {
      let role: Role | undefined;
      if (guildDoc.role) {
        role = interaction.guild.roles.cache.get(guildDoc.role);
      } else {
        role = await interaction.guild.roles.create({
          name: guildDoc.name,
          mentionable: true,
          color: 0x607d8b,
          position:
            interaction.guild.roles.cache.get(config.ids.roles.guildsDiv)
              ?.position ?? 0 + 1,
          permissions: 0n,
        });
        guildDoc.role = role.id;
        await guildDoc.save();
        for (const otherMemberDoc of memberDocs) {
          const otherMember = await interaction.guild.members
            .fetch(otherMemberDoc.user)
            .catch(() => null);
          if (otherMember) {
            await otherMember.roles.add(role);
          }
        }
        updates.push(
          `<:mod:1040429385066491946> **|** Cargo para o servidor **${guildDoc.name}** criado`,
        );
      }

      if (role) {
        await member.roles.add(role);
      }
    }

    if (updates.length) {
      interaction.client.updateServersData(updates);
    }
  },
});
