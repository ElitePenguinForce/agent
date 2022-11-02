const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
  data: {
    name: "request-dev-role-form"
  },

  async execute(interaction, client) {
    const modal = new ModalBuilder()
      .setCustomId(`devRequestModal`)
      .setTitle(`Elite Penguin Force`)

    const githubLink = new TextInputBuilder()
        .setCustomId(`githubLink`)
        .setLabel(`O link do seu perfil no GitHub`)
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setMinLength(10)
        .setMaxLength(50);

    const experienceInfo = new TextInputBuilder()
        .setCustomId(`experienceInfo`)
        .setLabel(`Qual sua atuação na área?`)
        .setRequired(true)
        .setPlaceholder("Criação de sites/bots, etc...")
        .setStyle(TextInputStyle.Paragraph)
        .setMinLength(3)
        .setMaxLength(4);

    const example = new TextInputBuilder()
        .setCustomId(`example`)
        .setLabel(`Nos envie um exemplo de um projeto seu.`)
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph)
        .setMinLength(20)
        .setMaxLength(150);

    const botInvite = new TextInputBuilder()
        .setCustomId(`botInvite`)
        .setLabel(`Convite do seu bot (Se não tiver, deixe em branco)`)
        .setStyle(TextInputStyle.Short)
        .setRequired(false)

    const requestAbout = new TextInputBuilder()
        .setCustomId(`requestAbout`)
        .setLabel(`Por que você quer o cargo de "Desenvolvedor"?`)
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph)
        .setMinLength(50)
        .setMaxLength(250);

    modal.addComponents(new ActionRowBuilder().addComponents(githubLink));
    modal.addComponents(new ActionRowBuilder().addComponents(experienceInfo));
    modal.addComponents(new ActionRowBuilder().addComponents(example));
    modal.addComponents(new ActionRowBuilder().addComponents(haveABot));
    modal.addComponents(new ActionRowBuilder().addComponents(botInvite));
    modal.addComponents(new ActionRowBuilder().addComponents(requestAbout));

    return await interaction.showModal(modal);
  }
}