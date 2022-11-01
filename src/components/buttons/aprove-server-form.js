const { EmbedBuilder } = require("discord.js");
const guild = require("../../models/guild");
const member = require("../../models/member");

module.exports = {
  data: {
    name: "aprove-server-form"
  },
  async execute(interaction, client) {
    const embed = EmbedBuilder.from(interaction.message.embeds[0]);

    const data = embed.data;
    
    const inviteField = data.fields.find(f => f.value.startsWith("https://"));
    if (!inviteField) return interaction.reply({ content: "Não foi possível obter informações sobre o servidor" });

    const fetchedInvite = await client.fetchInvite(inviteField.value).catch(() => null);
    if (!fetchedInvite) return interaction.reply({ content: "Não foi possível obter informações sobre o servidor" });

    const representativeId = data.fields[0].value.split(" ")[1].replace(/\D/g, '');
    const isAdmin = ['Dono', 'Administrador'].includes(data.fields[2].value);
    
    const guildMember = await interaction.guild.members.fetch(representativeId).catch(() => null);
    if (!guildMember) return interaction.reply({ content: `O representante não está mais no servidor (${representativeId})`, ephemeral: true });
    
    await guild.create({
      _id: fetchedInvite.guild.id,
      invite: fetchedInvite.code,
      name: fetchedInvite.guild.name,
      representative: representativeId
    });

    await member.create({
      user: representativeId,
      guild: fetchedInvite.guild.id,
      admin: isAdmin
    });

    const message = await guildMember.send({ content: `Parabéns, o seu servidor \`${fetchedInvite.guild.name}\` foi aprovado na EPF!` }).catch(() => null);
    if (!message) await interaction.reply({ content: "Não foi possível entrar em contato com o representante do servidor", ephemeral: true });
    
    embed.setColor('#58e600').setTitle("Formulário Aprovado");
    await interaction.message.edit({ embeds: [embed], components: [] });

    return interaction[interaction.replied || interaction.deferred ? 'followUp': 'reply']({ content: "Servidor Aprovado", ephemeral: true });
  }
}