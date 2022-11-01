const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    name: 'serverRefuseReasonModal'
  },
  async execute(interaction, client) {
    const embed = EmbedBuilder.from(interaction.message.embeds[0]);
    
    const inviteField = embed.data.fields.find(f => f.value.startsWith("https://"));
    const fetchedInvite = inviteField && await client.fetchInvite(inviteField.value).catch(() => null);
    
    const representativeId = embed.data.fields[0].value.split(" ")[1].replace(/\D/g, '');

    const reasonInput = interaction.fields.getTextInputValue("reason");
    
    embed.setColor('#d12c2c')
      .setTitle("Formulário Recusado")
      .addFields([
        { name: "Recusado pelo motivo", value: `${reasonInput || "Sem Motivo"}`, inline: true },
        { name: "Recusado por", value: `${interaction.user} (${interaction.user.id})`, inline: true },
      ])

    await interaction.message.edit({ embeds: [embed], components: [] });
    
    const member = await interaction.guild.members.fetch(representativeId).catch(() => null);
    if (member) {
      await member.send({ content: `O servidor \`${fetchedInvite?.guild.name || inviteField.value}\` foi recusado da EPF.${reasonInput ? `\nMotivo: ${reasonInput}` : ""}` })
        .catch(async () => await interaction.reply({ content: "Não foi possível entrar em contato com o representante do servidor", ephemeral: true }))
    }

    return interaction[interaction.replied || interaction.deferred ? 'followUp': 'reply']({ content: "Servidor Recusado", ephemeral: true });
  }
}