import { ApplicationCommandOptionType } from "discord.js";
import Guild from "../../../core/db/models/guild.js";
import createCommand from "../../../shared/factories/commands/index.js";
import handleServerAutocomplete from "../../../shared/helpers/handleServerAutocomplete.js";
import isGuard from "../../../shared/helpers/isGuard.js";

export default createCommand({
  data: {
    name: "changeinvite",
    nameLocalizations: {
      "pt-BR": "alterarconvite",
    },
    description: "Changes the invite link of a server",
    descriptionLocalizations: {
      "pt-BR": "Altera o link de convite de um servidor",
    },
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: "server",
        nameLocalizations: {
          "pt-BR": "servidor",
        },
        description: "The server you want to change the invite link of",
        descriptionLocalizations: {
          "pt-BR": "O servidor que você deseja alterar o link de convite",
        },
        required: true,
        autocomplete: handleServerAutocomplete,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: "invite",
        nameLocalizations: {
          "pt-BR": "convite",
        },
        description: "The new invite link",
        descriptionLocalizations: {
          "pt-BR": "O novo link de convite",
        },
        required: true,
      },
    ],
  },
  async execute(interaction) {
    const guildId = interaction.options.getString("server", true);
    const guildDoc = await Guild.findById(guildId);

    if (!guildDoc) {
      return interaction.reply({
        content: "Servidor não encontrado no sistema",
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
        content: "Você não é o representante desse servidor",
        ephemeral: true,
      });
    }

    const inviteString = interaction.options.getString("invite", true);
    const invite = await interaction.client
      .fetchInvite(inviteString)
      .catch(() => null);

    if (!invite?.guild) {
      return interaction.reply({
        content: "Link de convite inválido",
        ephemeral: true,
      });
    }

    if (invite.guild.id !== guildDoc._id) {
      return interaction.reply({
        content: "O convite não pertence ao servidor selecionado",
        ephemeral: true,
      });
    }

    if (invite.maxUses) {
      return interaction.reply({
        content:
          "O convite tem um limite de uso, crie um novo convite sem limite",
        ephemeral: true,
      });
    }

    if (invite.maxAge) {
      return interaction.reply({
        content:
          "O convite tem um tempo de expiração, crie um novo convite sem tempo de expiração",
        ephemeral: true,
      });
    }

    guildDoc.invite = invite.code;
    guildDoc.name = invite.guild.name;
    await guildDoc.save();

    if (guildDoc.role) {
      await interaction.guild.roles.cache
        .get(guildDoc.role)
        ?.setName(invite.guild.name);
    }

    interaction.client.updateServersData([
      `<:icon_guild:1037801942149242926> **|** Novo convite para o servidor **${guildDoc.name}** foi gerado`,
    ]);

    return interaction.reply({
      content:
        `Convite do servidor \`${guildDoc.name}\` alterado com sucesso!\n` +
        `Novo convite: ${invite.url}`,
    });
  },
});
