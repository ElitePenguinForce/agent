import { ComponentType, TextInputStyle } from "discord.js";
import Guild from "../../../../core/db/models/guild.js";
import createModal from "../../../../shared/factories/modal.js";
import {
  default as createServerRejection,
  default as reject,
} from "../../helpers/createServerRejection.js";
import createServerRequest from "../../helpers/createServerRequest.js";
import parseMemberRole from "../../helpers/parseMemberRole.js";

export default createModal({
  data: {
    customId: "serverRequestModal",
    title: "Elite Penguin Force",
    components: [
      {
        customId: "serverLink",
        type: ComponentType.TextInput,
        style: TextInputStyle.Short,
        minLength: 10,
        maxLength: 30,
        label: "Convite permanente do servidor",
        required: true,
      },
      {
        type: ComponentType.TextInput,
        customId: "serverRole",
        required: true,
        label: "Qual o seu cargo nesse servidor?",
        placeholder: "Dono(a), Adm ou mod",
        style: TextInputStyle.Short,
        minLength: 3,
        maxLength: 4,
      },
      {
        type: ComponentType.TextInput,
        customId: "serverAbout",
        label: "Conte-nos mais sobre esse servidor",
        required: true,
        style: TextInputStyle.Paragraph,
        minLength: 20,
        maxLength: 150,
      },
      {
        type: ComponentType.TextInput,
        customId: "epfAbout",
        label: "Por onde você conheceu a EPF?",
        required: true,
        style: TextInputStyle.Paragraph,
        minLength: 10,
        maxLength: 150,
      },
    ],
  },
  async execute(interaction) {
    const invite = interaction.fields.getTextInputValue("serverLink");
    const fetchedInvite = await interaction.client
      .fetchInvite(invite)
      .catch(() => null);

    const role = interaction.fields.getTextInputValue("serverRole");
    const parsedRole = parseMemberRole(role);

    const errors: string[] = [];

    if (!parsedRole) {
      errors.push(`Cargo Inválido (${role})`);
    }

    if (!fetchedInvite?.guild) {
      errors.push(`Convite Inválido: ${invite}`);
      return reject(interaction, errors);
    }

    const guildDoc = await Guild.findById(fetchedInvite.guild.id);
    if (guildDoc) {
      if (guildDoc.pending) {
        return interaction.reply({
          content: "Esse servidor já está em processo de avaliação",
          ephemeral: true,
        });
      } else {
        errors.push("Esse servidor já faz parte da EPF");
      }
    }

    if (fetchedInvite.expiresTimestamp) {
      errors.push("Convite Expirável");
    }

    if (fetchedInvite.maxUses) {
      errors.push("Convite com limite de uso");
    }

    if (fetchedInvite.memberCount < 5000) {
      errors.push("O servidor não atingiu os requisitos mínimos");
    }

    if (errors.length) {
      return createServerRejection(interaction, errors);
    }

    return createServerRequest(interaction, parsedRole, fetchedInvite);
  },
});
