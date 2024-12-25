import { ComponentType, EmbedBuilder, TextInputStyle } from "discord.js";
import createModal from "../../../../shared/factories/modal.js";

export default createModal({
  data: {
    customId: "devRefuseReasonModal",
    title: "Elite Penguin Force",
    components: [
      {
        type: ComponentType.TextInput,
        customId: "reason",
        label: "Defina um motivo",
        required: false,
        style: TextInputStyle.Paragraph,
      },
    ],
  },
  execute: async (interaction) => {
    const message = interaction.message;
    if (!message) {
      console.error("Não foi possível encontrar a mensagem", interaction);
      return interaction.reply({
        content: "Não foi possível encontrar a mensagem",
        ephemeral: true,
      });
    }

    const messageEmbed = message.embeds[0];
    if (!messageEmbed) {
      console.error("Não foi possível encontrar a mensagem", interaction);
      return interaction.reply({
        content: "Não foi possível encontrar a mensagem",
        ephemeral: true,
      });
    }

    const userId = interaction.customId.split(":")[1];
    if (!userId) {
      console.error("Não foi possível encontrar o usuário", interaction);
      return interaction.reply({
        content: "Não foi possível encontrar o usuário",
        ephemeral: true,
      });
    }

    const reason = interaction.fields.getTextInputValue("reason");
    const embed = EmbedBuilder.from(messageEmbed)
      .setColor("#d12c2c")
      .setTitle("Pedido Recusado")
      .addFields([
        {
          name: "Recusado pelo motivo",
          value: `${reason || "Sem Motivo"}`,
          inline: true,
        },
        {
          name: "Recusado por",
          value: `${interaction.user} (${interaction.user.id})`,
          inline: true,
        },
      ]);

    await message.edit({ embeds: [embed], components: [] });

    if (message.thread) {
      await message.thread.setArchived(true);
    }

    const member = await interaction.guild.members
      .fetch(userId)
      .catch(() => null);
    if (member) {
      const content =
        "Lamentamos informar que a sua requisição de cargo de desenvolvedor na EPF foi recusada.";
      await member
        .send(reason ? `${content}\nMotivo: ${reason}` : content)
        .catch(() => {
          interaction.reply({
            content: "Não foi possível entrar em contato com o membro",
            ephemeral: true,
          });
        });
    }

    return interaction[
      interaction.replied || interaction.deferred ? "followUp" : "reply"
    ]({
      content: "Desenvolvedor Recusado",
      ephemeral: true,
    });
  },
});
