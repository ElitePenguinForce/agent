import { ComponentType, EmbedBuilder } from "discord.js";
import config from "../../../core/config/index.js";
import createEvent from "../../../shared/factories/event.js";
import applyDevButton from "../components/dev/apply-form.js";
import applyServerButton from "../components/server/apply-form.js";

export default createEvent({
  name: "ready",
  execute: async (client) => {
    const guild = client.guilds.cache.get(config.ids.guild);

    if (!guild) {
      throw new Error("Guild not found");
    }

    await guild.members.fetch();
    await guild.commands.fetch();

    const serverFormChannel = guild.channels.cache.get(
      config.forms.guild.channelId,
    );

    if (!serverFormChannel) {
      throw new Error("Server form channel not found");
    }

    if (!serverFormChannel.isTextBased()) {
      throw new Error("Server form channel is not text based");
    }

    const serverFormMessage = (
      await serverFormChannel.messages.fetch({ limit: 1 }).catch(() => null)
    )?.first();

    if (!serverFormMessage || serverFormMessage.author.id !== client.user.id) {
      const serverRequirementsEmbed = new EmbedBuilder()
        .setTitle("<:info:1095440963620573394> Requisitos")
        .setImage(
          "https://cdn.discordapp.com/attachments/1034845518452502658/1034845554796150815/Requisitos.png",
        )
        .setColor(config.forms.guild.color)
        .setDescription(
          "<:globe:1095440970516021298> Para adicionar algum servidor a EPF é necessário que tenha no" +
            " mínimo **5.000 membros** ou que sejam **verificados** ou **parceiros** do Discord e atenda a" +
            " todos os  [termos de serviço](https://discord.com/terms) e as" +
            " [diretrizes](https://discord.com/guidelines) do Discord.",
        );

      const registerServerEmbed = new EmbedBuilder()
        .setTitle(`${config.forms.guild.emoji} Aplicar Servidor`)
        .setImage(config.forms.guild.bannerURL)
        .setColor(config.forms.guild.color)
        .setDescription(
          `<:green_dot:1037803471077908553> **|** Se você representa um servidor que cumpre os requisitos listados acima e acha que ele merece fazer parte da **Elite Penguin Force**, clique no botão abaixo e preencha o formulário para enviá-lo para uma avaliação.\n\n` +
            `<:icon_idle_green:1037806417438068766> **| Lembrando:** Você será avisado assim que a avaliação tenha terminado. Por isso lembre de deixar suas "Mensagens Diretas" abertas.`,
        );
      serverFormChannel.send({
        embeds: [serverRequirementsEmbed, registerServerEmbed],
        components: [
          {
            type: ComponentType.ActionRow,
            components: [applyServerButton.create()],
          },
        ],
      });
    }

    const devFormChannel = guild.channels.cache.get(config.forms.dev.channelId);

    if (!devFormChannel) {
      throw new Error("Developer form channel not found");
    }

    if (!devFormChannel.isTextBased()) {
      throw new Error("Developer form channel is not text based");
    }

    const devFormMessage = (
      await devFormChannel.messages.fetch({ limit: 1 }).catch(() => null)
    )?.first();

    if (!devFormMessage || devFormMessage.author.id !== client.user.id) {
      const devRequirementsEmbed = new EmbedBuilder()
        .setTitle("<:info:1095440963620573394> Requisitos")
        .setImage(
          "https://cdn.discordapp.com/attachments/1034845518452502658/1034845554796150815/Requisitos.png",
        )
        .setColor(config.forms.dev.color)
        .setDescription(
          "<:monitor:1095441115936739450> Para receber o cargo <@&822202388780941313>, é necessário" +
            " que cumpra com algum dos seguintes requisitos:\n" +
            "<:point_epf:1037183758761205841> Possuir um bot verificado (online);\n" +
            "<:point_epf:1037183758761205841> Ter um bot privado de algum dos servidores associados à EPF;\n" +
            "<:point_epf:1037183758761205841> Trabalhar com desenvolvimento de software;\n" +
            "<:point_epf:1037183758761205841> Ter contribuições/projetos documentados no" +
            " [GitHub](https://github.com/).",
        );

      const requestDevRoleEmbed = new EmbedBuilder()
        .setTitle(`${config.forms.dev.emoji} Aplicar para Desenvolvedor`)
        .setImage(config.forms.dev.bannerURL)
        .setColor(config.forms.dev.color)
        .setDescription(
          `<:point_epf:1037183758761205841> **|** Se você atualmente atua na área da programação que cumpre os requisitos listados acima e quer fazer parte da **Elite Penguin Force** como um Developer, clique no botão abaixo e preencha o formulário para enviá-lo para uma avaliação.\n\n` +
            `<:icon_idle:1037801013358379048> **| Lembrando:** Você será avisado assim que a avaliação tenha terminado. Por isso lembre de deixar suas "Mensagens Diretas" abertas.`,
        );

      devFormChannel.send({
        embeds: [devRequirementsEmbed, requestDevRoleEmbed],
        components: [
          {
            type: ComponentType.ActionRow,
            components: [applyDevButton.create()],
          },
        ],
      });
    }
  },
});
