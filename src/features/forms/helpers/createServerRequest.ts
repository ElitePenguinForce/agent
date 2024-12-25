import {
  ComponentType,
  EmbedBuilder,
  type Guild as _Guild,
  type Invite,
  type ModalSubmitInteraction,
} from "discord.js";
import config from "../../../core/config/index.js";
import Guild from "../../../core/db/models/guild.js";
import Member from "../../../core/db/models/member.js";
import type { ReadableStaffRole } from "../../../shared/types/index.js";
import approveFormButton from "../components/server/approve-form.js";
import refuseFormButton from "../components/server/refuse-form.js";

export default async function createRequest(
  interaction: ModalSubmitInteraction<"cached">,
  role: ReadableStaffRole | null,
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

  const approveChannel = interaction.client.channels.cache.get(
    config.ids.channels.approve,
  );

  if (approveChannel?.isSendable()) {
    const message = await approveChannel.send({
      embeds: [embed],
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            approveFormButton.create(guild.id),
            refuseFormButton.create(guild.id),
          ],
        },
      ],
    });
    await message.startThread({ name: `Server ${guild.name}` });
  }
}
