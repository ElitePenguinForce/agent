const { EmbedBuilder } = require("discord.js");

module.exports = {
    data: {
        name: 'devRefuseReasonModal'
    },
    async execute(interaction, client) {
        const embed = EmbedBuilder.from(interaction.message.embeds[0]);

        const reasonInput = interaction.fields.getTextInputValue("reason");

        embed.setColor('#d12c2c')
            .setTitle("Pedido Recusado")
            .addFields([
                { name: "Recusado pelo motivo", value: `${reasonInput || "Sem Motivo"}`, inline: true },
                { name: "Recusado por", value: `${interaction.user} (${interaction.user.id})`, inline: true },
            ])

        await interaction.message.edit({ embeds: [embed], components: [] });

        await interaction[interaction.replied || interaction.deferred ? 'followUp' : 'reply']({
            content: "Desenvolvedor Recusado",
            ephemeral: true,
        });
    }
}

