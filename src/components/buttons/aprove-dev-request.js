const { EmbedBuilder } = require("discord.js");
const config = require('../../config');

module.exports = {
  data: {
    name: "aprove-dev-request"
  },

  async execute(interaction, client) {
    const member = await interaction.guild.members.fetch(interaction.customId.split(":")[1]).catch(() => null);
    
    if (member) await member.roles.add(config.devID);
    else return interaction[interaction.replied || interaction.deferred ? 'followUp' : 'reply']({ content: "Membro não encontrado... Não consegui dar o cargo à ele", ephemeral: true });

    const embed = EmbedBuilder.from(interaction.message.embeds[0]);

    const message = await guildMember.send({ content: `Parabéns, você foi aprovado e está apto para receber o cargo de Developer no EPF!` }).catch(() => null);
    if (!message) await interaction.reply({ content: "Não foi possível entrar em contato com o requisitante do cargo", ephemeral: true });

    embed.setColor('#58e600').setTitle("Formulário Aprovado - Developer");
    await interaction.message.edit({ embeds: [embed], components: [] });

    await interaction[interaction.replied || interaction.deferred ? 'followUp' : 'reply']({ content: "Servidor Aprovado", ephemeral: true });
  }
}