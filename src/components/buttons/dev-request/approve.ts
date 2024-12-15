import { ButtonStyle, EmbedBuilder, parseWebhookURL } from "discord.js";
import env from "../../../env.js";
import createButton from "../../../factories/button.js";
import config from "../../../config.js";

export default createButton({
  id: "approve-dev-request",
  create: (id, userId) => {
    if (!userId) {
      throw new Error("userId is required in approve dev request button");
    }
    return {
      customId: `${id}:${userId}`,
      label: "Aprovar",
      style: ButtonStyle.Success,
    };
  },
  execute: async (interaction) => {
    const userId = interaction.customId.split(":")[1];
    if (!userId) {
      console.error(
        `Button ${interaction.customId} is missing userId`,
        interaction,
      );
      return interaction.reply({
        content: "Ocorreu um erro ao processar o botão clicado",
        ephemeral: true,
      });
    }
    const member = await interaction.guild.members
      .fetch(userId)
      .catch(() => null);

    if (member) {
      await member.roles.add(config.ids.roles.dev);
    } else {
      return interaction[
        interaction.replied || interaction.deferred ? "followUp" : "reply"
      ]({
        content: "Membro não encontrado... Não consegui dar o cargo à ele",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const messageEmbed = interaction.message.embeds[0];
    if (!messageEmbed) {
      console.error(
        `Button ${interaction.customId} is missing message embed`,
        interaction,
      );
      return interaction.followUp({
        content: "Ocorreu um erro ao processar o botão clicado",
        ephemeral: true,
      });
    }

    const embed = EmbedBuilder.from(messageEmbed);

    const message = await member
      .send({
        content: `Parabéns, você foi aprovado e está apto para receber o cargo de Developer no EPF!`,
      })
      .catch(() => null);
    if (!message) {
      console.error(
        `Button ${interaction.customId} is missing message`,
        interaction,
      );
      return interaction.followUp({
        content:
          "Não foi possível entrar em contato com o requisitante do cargo",
        ephemeral: true,
      });
    }

    embed.setColor("#58e600").setTitle("Formulário Aprovado - Developer");
    await interaction.message.edit({ embeds: [embed], components: [] });

    if (interaction.message.thread) {
      await interaction.message.thread.setArchived(true);
    }

    await interaction.followUp({
      content: "Desenvolvedor Aprovado",
      ephemeral: true,
    });

    const webhook = parseWebhookURL(env.OFFTOPIC_WEBHOOK);
    if (!webhook) {
      console.error(
        `Button ${interaction.customId} is missing webhook`,
        interaction,
      );
      return interaction.followUp({
        content: "Não foi possível enviar a mensagem para o canal de off-topic",
        ephemeral: true,
      });
    }

    await interaction.client
      .fetchWebhook(webhook.id, webhook.token)
      .then(async (webhook) => {
        await webhook.send({
          content: `<:icons_djoin:875754472834469948> O membro ${member} foi aprovado como desenvolvedor na EPF`,
          username: interaction.guild.name,
          avatarURL: interaction.guild.iconURL() || undefined,
          allowedMentions: {
            users: [],
          },
        });
      });
  },
});
