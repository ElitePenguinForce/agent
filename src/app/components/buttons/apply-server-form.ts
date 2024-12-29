import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import config from "../../../core/config/index.js";
import createButton from "../../../shared/factories/buttons/index.js";
import serverRequestModal from "../modals/server-form.js";

export default createButton({
  id: "register-server-form",
  create: () => {
    return {
      label: "Formulário de Servidor",
      style: ButtonStyle.Secondary,
      emoji: config.forms.guild.emoji,
    };
  },
  async execute(interaction) {
    const confirmationEmbed = new EmbedBuilder()
      .setTitle("Leia antes de continuar")
      .setDescription(
        "Esse formulário deve ser preenchido para associar um **novo servidor** à EPF, se você deseja apenas " +
          "ser registrado em um servidor que já faz parte da comunidade, por favor peça para o representante do" +
          " servidor em questão te registrar.\n\n" +
          "Ao confirmar, você concorda que você será o representante do servidor dentro da EPF (Elite Penguin " +
          "Force). E que a responsabilidade da sua staff dentro do nosso servidor será inteiramente sua.\n\n" +
          "Tenha em mente de que a resposta do formulário será enviada diretamente em sua DM, então mantenha " +
          "ela aberta para receber a resposta.",
      )
      .setColor(0x2f3136);

    const buttonConfirm = new ButtonBuilder()
      .setCustomId("collector:confirm")
      .setLabel("Confirmar")
      .setStyle(ButtonStyle.Success);

    const buttonCancel = new ButtonBuilder()
      .setCustomId("collector:cancel")
      .setLabel("Cancelar")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
      buttonConfirm,
      buttonCancel,
    );

    const reply = await interaction.reply({
      embeds: [confirmationEmbed],
      components: [row],
      ephemeral: true,
      fetchReply: true,
    });

    const collector = reply.createMessageComponentCollector({
      filter: (interaction) => interaction.user.id === interaction.user.id,
      time: 60000,
      max: 1,
    });

    collector.on("collect", async (interaction) => {
      if (interaction.customId === "collector:confirm") {
        return await interaction.showModal(serverRequestModal.create());
      }

      return interaction.reply({
        content: "Operação cancelada.",
        ephemeral: true,
      });
    });

    collector.on("end", async (collected) => {
      if (!reply.editable) {
        return;
      }

      if (collected.size) {
        buttonConfirm.setDisabled(true);
        buttonCancel.setDisabled(true);
        row.setComponents(buttonConfirm, buttonCancel);

        return interaction.editReply({
          embeds: [confirmationEmbed],
          components: [row],
        });
      }

      return interaction.editReply({
        content: "Tempo esgotado.",
        embeds: [],
        components: [],
      });
    });
  },
});
