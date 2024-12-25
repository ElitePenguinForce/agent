import { ComponentType, EmbedBuilder, TextInputStyle } from "discord.js";
import Guild from "../../../../core/db/models/guild.js";
import createModal from "../../../../shared/factories/modal.js";

export default createModal({
  data: {
    customId: "refuse-server-form",
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
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const message = interaction.message;
    if (!message) {
      return interaction.editReply({
        content: "Não foi possível encontrar a mensagem",
      });
    }

    const messageEmbed = message.embeds[0];
    if (!messageEmbed) {
      return interaction.editReply({
        content: "Não foi possível encontrar a embed da mensagem",
      });
    }

    const embed = EmbedBuilder.from(messageEmbed);
    const reason = interaction.fields.getTextInputValue("reason");

    embed
      .setColor("#d12c2c")
      .setTitle("Formulário Recusado")
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

    const guildId = interaction.customId.split(":")[1];
    if (!guildId) {
      return interaction.editReply({
        content: "ID do servidor não foi encontrado",
      });
    }

    const guildDoc = await Guild.findByIdAndDelete(guildId);
    if (!guildDoc) {
      return interaction.editReply({
        content: `ID do servidor é inválido e não foi encontrado: ${guildId}`,
      });
    }

    const member = await interaction.guild.members
      .fetch(guildDoc.representative)
      .catch(() => null);
    if (member) {
      const content = `O servidor \`${guildDoc.name}\` foi recusado da EPF.`;
      await member
        .send(reason ? `${content}\nMotivo: ${reason}` : content)
        .catch(() => {
          interaction.reply({
            content:
              "Não foi possível entrar em contato com o representante do servidor",
            ephemeral: true,
          });
        });
    }

    return interaction.editReply({
      content: "Servidor Recusado",
    });
  },
});
