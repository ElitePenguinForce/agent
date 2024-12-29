import { ButtonStyle, EmbedBuilder, parseWebhookURL } from "discord.js";
import env from "../../../core/config/env.js";
import config from "../../../core/config/index.js";
import Guild from "../../../core/db/models/guild.js";
import Member from "../../../core/db/models/member.js";
import createButton from "../../../shared/factories/buttons/index.js";

export default createButton({
  id: "approve-server-form",
  data: {
    label: "Aprovar",
    style: ButtonStyle.Success,
  },
  async execute(interaction, guildId) {
    const messageEmbed = interaction.message.embeds[0];
    if (!messageEmbed) {
      return interaction.reply({
        content: "Não foi possível encontrar o embed da mensagem",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const guildDoc = await Guild.findById(guildId);

    if (!guildDoc) {
      return interaction.editReply("Servidor não encontrado");
    }

    const member = await interaction.guild.members
      .fetch(guildDoc.representative)
      .catch(() => null);
    if (!member) {
      return interaction.editReply(
        `O representante não está mais no servidor (${guildDoc.representative})`,
      );
    }

    guildDoc.pending = false;
    await guildDoc.save();

    if (guildDoc.owner === member.id) {
      await member.roles.add(config.ids.roles.owner);
    } else {
      const memberDoc = await Member.findOne({
        user: member.id,
        guild: guildDoc._id,
      });
      await member.roles.add(
        memberDoc?.admin ? config.ids.roles.admin : config.ids.roles.mod,
      );
    }

    const hasSentMessage = await member
      .send({
        content: `Parabéns, o seu servidor \`${guildDoc.name}\` foi aprovado na EPF!`,
      })
      .then(() => true)
      .catch(() => false);
    if (!hasSentMessage) {
      await interaction.editReply(
        "Não foi possível entrar em contato com o representante do servidor",
      );
    }
    const embed = EmbedBuilder.from(messageEmbed)
      .setColor("#58e600")
      .setTitle("Formulário Aprovado")
      .addFields({
        name: "Aprovado por",
        value: `<@${interaction.user.id}>`,
      });
    await interaction.message.edit({ embeds: [embed], components: [] });

    if (interaction.message.thread) {
      await interaction.message.thread.setArchived(true);
    }

    if (interaction.replied) {
      await interaction.followUp({
        content: "Servidor Aprovado",
        ephemeral: true,
      });
    } else {
      await interaction.editReply("Servidor Aprovado");
    }

    interaction.client.updateServersData([
      `<:icon_guild:1037801942149242926> **|** Novo servidor aprovado: **${guildDoc.name}**`,
    ]);

    const webhookData = parseWebhookURL(env.OFFTOPIC_WEBHOOK);
    if (!webhookData) {
      return;
    }

    const webhook = await interaction.client.fetchWebhook(
      webhookData.id,
      webhookData.token,
    );

    return webhook.send({
      content: `<:icons_djoin:875754472834469948> O servidor **${guildDoc.name}** entrou para a EPF`,
      username: interaction.guild.name,
      avatarURL: interaction.guild.iconURL() || undefined,
    });
  },
});
