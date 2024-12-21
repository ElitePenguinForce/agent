import {
  ComponentType,
  EmbedBuilder,
  TextInputStyle,
  type Guild as _Guild,
  type Invite,
  type ModalSubmitInteraction,
} from "discord.js";
import approveServerButton from "../../components/buttons/server-form/approve.js";
import refuseServerButton from "../../components/buttons/server-form/refuse.js";
import Guild from "../../db/models/guild.js";
import Member from "../../db/models/member.js";
import { autoRejectEmbed } from "../../factories/embeds/autoRejectGuild.js";
import createModal from "../../factories/modal.js";
import config from "../../config.js";

type Role = "Dono" | "Administrador" | "Moderator";

function parseMemberRole(role: string): Role | null {
  switch (role.toLowerCase()) {
    case "mod":
      return "Moderator";
    case "adm":
    case "admin":
      return "Administrador";
    case "dono":
    case "dona":
    case "owner":
      return "Dono";
    default:
      return null;
  }
}

function getApproveChannel(interaction: ModalSubmitInteraction) {
  return interaction.client.channels.cache.get(config.ids.channels.approve);
}

async function reject(
  interaction: ModalSubmitInteraction<"cached">,
  errors: string[],
) {
  const role = interaction.fields.getTextInputValue("serverRole");
  const parsedRole = parseMemberRole(role);

  const serverAbout = interaction.fields.getTextInputValue("serverAbout");
  const epfAbout = interaction.fields.getTextInputValue("epfAbout");

  await interaction.member
    .send({
      content: `O seu servidor foi recusado automaticamente pelo seguinte motivo:\n${errors.join(
        "\n",
      )}`,
    })
    .catch(() => null);
  await interaction.reply({
    ephemeral: true,
    content:
      "Seu servidor foi rejeitado devido a um erro no formulário, consulte sua DM para mais informações, caso sua DM seja privada sugerimos que deixe ela pública para receber novas informaçòes vindas do nosso bot Agent",
  });

  const approveChannel = getApproveChannel(interaction);

  if (approveChannel?.isSendable()) {
    const embed = autoRejectEmbed({
      sender: interaction.user,
      epfAbout,
      serverAbout,
      errors,
      role: parsedRole,
    });

    await approveChannel.send({ embeds: [embed] });
  }

  return;
}

async function createRequest(
  interaction: ModalSubmitInteraction<"cached">,
  role: Role | null,
  invite: Invite,
) {
  const serverAbout = interaction.fields.getTextInputValue("serverAbout");
  const epfAbout = interaction.fields.getTextInputValue("epfAbout");
  const userEmbed = new EmbedBuilder()
    .setTitle(`Formulário enviado`)
    .setDescription(
      "Sua solicitação foi enviada com sucesso\n\nFazer esse formulário **não** garante a entrada da sua comunidade na EPF." +
        "\nSua requisição passará por uma analise e a equipe determinará se seu servidor está apto ou não.",
    )
    .setColor("#fccf03");

  await interaction.reply({
    embeds: [userEmbed],
    ephemeral: true,
  });

  const embed = new EmbedBuilder()
    .setTitle(`Novo formulário`)
    .setColor("#fccf03")
    .setFields([
      {
        name: "Enviado por",
        value: `${interaction.user.username} (${interaction.user.id})`,
        inline: true,
      },
      {
        name: "Link permanente do servidor",
        value: `${invite.url || "Inválido"}`,
        inline: true,
      },
      {
        name: "Cargo Principal no Servidor",
        value: `${role || "Inválido"}`,
        inline: true,
      },
      { name: "Sobre o servidor", value: `${serverAbout}`, inline: false },
      {
        name: "Por onde conheceu a EPF",
        value: `${epfAbout}`,
        inline: false,
      },
    ]);

  const guild = invite.guild as _Guild;

  const newGuildDoc = new Guild({
    _id: guild.id,
    representative: interaction.user.id,
    invite: invite.code,
    name: guild.name,
    owner: role === "Dono" ? interaction.user.id : null,
    pending: true,
  });
  await newGuildDoc.save();
  await Member.create({
    user: interaction.user.id,
    guild: newGuildDoc._id,
    admin: role === "Administrador" || role === "Dono",
  });

  const approveChannel = getApproveChannel(interaction);

  if (approveChannel?.isSendable()) {
    const message = await approveChannel.send({
      embeds: [embed],
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            approveServerButton.create(guild.id),
            refuseServerButton.create(guild.id),
          ],
        },
      ],
    });
    await message.startThread({ name: `Server ${guild.name}` });
  }
}

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
      return reject(interaction, errors);
    }

    return createRequest(interaction, parsedRole, fetchedInvite);
  },
});
