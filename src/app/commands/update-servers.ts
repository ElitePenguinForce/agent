import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import Constants from "../../core/db/models/constants.js";
import createCommand from "../../shared/factories/commands/index.js";

export default createCommand({
  data: {
    name: "updateservers",
    description: "Atualiza a lista de servidores que fazem parte da EPF",
    dmPermission: false,
    defaultMemberPermissions: ["Administrator"],
  },
  async execute(interaction) {
    const constants = await Constants.getConstants();
    if (constants.updatingGuildsChannel) {
      return await interaction.reply({
        content:
          "Uma atualização já foi solicitada, aguarde o término da atualização para solicitar novamente.",
        ephemeral: true,
      });
    }
    await interaction.deferReply({ ephemeral: true });
    const now = Date.now();
    if (now - constants.lastGuildsChannelUpdate.getTime() < 600000) {
      const confirmButton = new ButtonBuilder()
        .setCustomId("collector:confirm")
        .setLabel("Confirmar")
        .setStyle(ButtonStyle.Success);
      const cancelButton = new ButtonBuilder()
        .setCustomId("collector:cancel")
        .setLabel("Cancelar")
        .setStyle(ButtonStyle.Danger);

      const reply = await interaction.editReply({
        content:
          "A última atualização foi a menos de 10 minutos, deseja atualizar novamente?",
        components: [
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            confirmButton,
            cancelButton,
          ),
        ],
      });

      const collector = reply.createMessageComponentCollector({
        time: 60000,
        filter: (interaction) => interaction.user.id === interaction.user.id,
        max: 1,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.customId === "collector:cancel") {
          return interaction.update({
            content: "Operação cancelada",
            components: [],
          });
        }
        await interaction.update({
          content: "Lista de servidores atualizada",
          components: [],
        });
        interaction.client.updateServersData([
          `<:e_repeat:1049017561175568404> **|** A lista de servidores foi atualizada pois o ${interaction.user} pediu!`,
        ]);
      });

      collector.on("end", async (_, reason) => {
        if (reason === "time") {
          return interaction.editReply({
            content: "Operação cancelada",
            components: [],
          });
        }
      });

      return;
    }

    interaction.client.updateServersData([
      `<:e_repeat:1049017561175568404> **|** A lista de servidores foi atualizada pois o ${interaction.user} pediu!`,
    ]);

    return interaction.editReply("Lista de servidores atualizada");
  },
});
