import { ComponentType, EmbedBuilder } from "discord.js";
import devRoleRequestButton from "../components/buttons/dev-request/request.js";
import serverRegisterButton from "../components/buttons/server-form/register.js";
import Constants from "../db/models/constants.js";
import Guild from "../db/models/guild.js";
import createEvent from "../factories/event.js";
import config from "../config.js";

export default createEvent({
  name: "ready",
  execute: async (client) => {
    console.log(`Logado em ${client.user.username} (${client.user.id})`);
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
            components: [serverRegisterButton.create()],
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
            components: [devRoleRequestButton.create()],
          },
        ],
      });
    }

    // se crashar ou reiniciar no meio de uma atualização, ele vai refazer essa atualização já
    // que a ela não foi finalizada devidamente
    const constants = await Constants.getConstants();
    if (constants.updatingGuildsChannel || constants.scheduledUpdate) {
      await Constants.updateConstants({
        updatingGuildsChannel: false,
        scheduledUpdate: false,
      });
      client.updateServersData(
        [
          "<:e_repeat:1049017561175568404> **|** A última atualização não foi bem sucedida, por isso será refeita",
        ],
        true,
      );
    }

    const clock = () =>
      setTimeout(
        async () => {
          const now = Date.now();
          await guild.members.fetch();
          const pendingGuilds = await Guild.find({ pending: true });
          const divRole = guild.roles.cache.get(config.ids.roles.guildsDiv);
          if (!divRole) {
            throw new Error("Guilds division role not found");
          }
          for (const member of guild.members.cache
            .filter(
              (member) =>
                !member.user.bot &&
                member.roles.highest.position < divRole.position &&
                member.joinedTimestamp &&
                member.joinedTimestamp < now - 24 * 60 * 60 * 1000 &&
                !pendingGuilds.some((g) => g.representative === member.id),
            )
            .values()) {
            await member.kick();
          }
          clock();
        },
        60 * 60 * 1000,
      );
    clock();
  },
});
