import {
  ComponentType,
  EmbedBuilder,
  TextInputStyle,
  type User,
} from "discord.js";
import config from "../../../../core/config/index.js";
import { DISCORD_INVITE_REGEX } from "../../../../shared/constants.js";
import createModal from "../../../../shared/factories/modal.js";
import devApproveButton from "../../components/dev/approve-form.js";
import devRefuseButton from "../../components/dev/refuse-form.js";

export default createModal({
  data: {
    customId: "devRequestModal",
    title: "Elite Penguin Force",
    components: [
      {
        type: ComponentType.TextInput,
        customId: "githubLink",
        label: "O link do seu perfil no Github, Gitlab ou Bitbucket",
        required: true,
        style: TextInputStyle.Short,
      },
      {
        type: ComponentType.TextInput,
        customId: "experienceInfo",
        label: "Qual sua atuação na área?",
        required: true,
        style: TextInputStyle.Paragraph,
        placeholder: "Criação de sites/bots, etc...",
      },
      {
        type: ComponentType.TextInput,
        customId: "example",
        label: "Nos envie um exemplo de um projeto seu",
        required: true,
        style: TextInputStyle.Paragraph,
      },
      {
        type: ComponentType.TextInput,
        customId: "botInvite",
        label: "Convite do seu bot (se houver)",
        required: false,
        style: TextInputStyle.Short,
      },
    ],
  },
  execute: async (interaction) => {
    let bot: User | null = null;
    let botInvite: string | null = null;

    const invite = interaction.fields.getTextInputValue("botInvite");

    if (DISCORD_INVITE_REGEX.test(invite)) {
      const clientId = invite.split("client_id=")[1]?.split("&")?.[0];
      if (!clientId) {
        return interaction.reply({
          content: "O convite do bot não é válido",
          ephemeral: true,
        });
      }

      bot = await interaction.client.users.fetch(clientId).catch(() => null);
      botInvite = invite.replace(/permissions=[0-9]*/gi, "permissions=0");
    }

    const embed = new EmbedBuilder()
      .setTitle("Novo formulário - Desenvolvedor")
      .setColor("#e3ba03")
      .setFields([
        {
          name: "Enviado por",
          value: `${interaction.user.username} (${interaction.user.id})`,
          inline: true,
        },
        {
          name: "GitHub",
          value: `${interaction.fields.getTextInputValue("githubLink")}`,
          inline: true,
        },
        {
          name: "Atuação",
          value: `${interaction.fields.getTextInputValue("experienceInfo")}`,
          inline: true,
        },
        {
          name: "Exemplo",
          value: `${interaction.fields.getTextInputValue("example")}`,
          inline: true,
        },
        {
          name: "Bot",
          value: bot ? `${bot.tag} (${bot.id})` : "Não tem",
          inline: true,
        },
        {
          name: "Convite",
          value: `${bot ? botInvite || "Inválido" : "Não tem"}`,
          inline: true,
        },
      ]);

    const aproveChannel = interaction.client.channels.cache.get(
      config.ids.channels.approve,
    );

    if (!aproveChannel) {
      return interaction.reply({
        content: "O canal de aprovação não foi encontrado",
        ephemeral: true,
      });
    }

    if (!aproveChannel.isSendable()) {
      return interaction.reply({
        content: "O canal de aprovação não é um canal de texto",
        ephemeral: true,
      });
    }

    const message = await aproveChannel.send({
      embeds: [embed],
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            devApproveButton.create(interaction.user.id),
            devRefuseButton.create(interaction.user.id),
          ],
        },
      ],
    });

    await message.startThread({ name: `Dev ${interaction.user.username}` });

    await interaction.reply({
      content: "Seu pedido foi enviado para avaliação.",
      ephemeral: true,
    });
  },
});
