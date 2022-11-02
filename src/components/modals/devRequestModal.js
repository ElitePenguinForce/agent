const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require ('discord.js')
const config = require('../../config');

module.exports = {
    data: {
        name: 'devRequestModal'
    },

    async execute(interaction, client) {
      const invite = interaction.fields.getTextInputValue("botInvite");
      const aproveChannel = client.channels.cache.get(config.aproveChannel);
      
      var bot = null, botInvite = null;

      if (invite.value !== null) {
        if (invite.includes("discord.com/oauth2/authorize")) {
          const clientId = invite.split("client_id=")[1].split("&")[0];
          
          bot = await client.users.fetch(clientId).catch(() => null);
          
          if (clientId !== null) {
            botInvite = invite.replace(/permissions=[0-9]*/ig, "permissions=0");
          }
        }
      }

      const embed = new EmbedBuilder()
        .setTitle(`Novo formulário - Desenvolvedor`)
        .setColor('#e3ba03')
        .setFields([
            { name: "Enviado por", value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
            { name: "GitHub", value: `${interaction.fields.getTextInputValue("githubLink")}`, inline: true },
            { name: "Atuação", value: `${interaction.fields.getTextInputValue("experienceInfo")}`, inline: true },
            { name: "Exemplo", value: `${interaction.fields.getTextInputValue("example")}`, inline: true },
            { name: "Bot", value: bot ? `${bot?.tag} ${bot?.id}` : "Não tem", inline: true },
            { name: "Convite", value: `${bot ? (botInvite || "Inválido") : "Não tem"}`, inline: true },
        ]);
        
        const row = new ActionRowBuilder()
          .setComponents(
            new ButtonBuilder()
              .setCustomId(`aprove-dev-request:${interaction.user.id}`)
              .setLabel("Aprovar")
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`refuse-dev-request:${interaction.user.id}`)
              .setLabel("Recusar")
              .setStyle(ButtonStyle.Danger)
        );

      await aproveChannel.send({
        embeds: [embed], components: [row]
      });

      await interaction.reply({
        content: 'Seu pedido foi enviado para avaliação.',
        ephemeral: true,
      });
    }
}

