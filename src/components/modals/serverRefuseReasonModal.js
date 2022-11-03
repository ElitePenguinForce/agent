const { EmbedBuilder } = require("discord.js");

module.exports = {
    data: {
        name: 'serverRefuseReasonModal'
    },
    async execute(interaction, client) {
        const embed = EmbedBuilder.from(interaction.message.embeds[0]);

        const reasonInput = interaction.fields.getTextInputValue("reason");

        embed.setColor('#d12c2c')
            .setTitle("Formulário Recusado")
            .addFields([
                { name: "Recusado pelo motivo", value: `${reasonInput || "Sem Motivo"}`, inline: true },
                { name: "Recusado por", value: `${interaction.user} (${interaction.user.id})`, inline: true },
            ])

        await interaction.message.edit({ embeds: [embed], components: [] });

        const guildModel = require('../../models/guild.js');
        const guildDoc = await guildModel.findByIdAndDelete(interaction.customId.split(':')[1]);

        const member = await interaction.guild.members.fetch(guildDoc.representative).catch(() => null);
        const content = `O servidor \`${guildDoc.name}\` foi recusado da EPF.`;
        if(member) {
            await member
                .send(reasonInput ? `${content}\nMotivo: ${reasonInput}` : content)
                .catch(async () => {
                    await interaction.reply({
                        content: "Não foi possível entrar em contato com o representante do servidor",
                        ephemeral: true,
                    });
                });
        }

        await interaction[interaction.replied || interaction.deferred ? 'followUp' : 'reply']({
            content: "Servidor Recusado",
            ephemeral: true,
        });
    }
}