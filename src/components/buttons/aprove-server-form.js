const { EmbedBuilder } = require("discord.js");
const guildModel = require("../../models/guild");

module.exports = {
    data: {
        name: "aprove-server-form"
    },
    async execute(interaction, client) {
        const embed = EmbedBuilder.from(interaction.message.embeds[0]);

        const guildDoc = await guildModel.findById(interaction.customId.split(':')[1]);

        const guildMember = await interaction.guild.members.fetch(guildDoc.representative).catch(() => null);
        if (!guildMember) return await interaction.reply({
            content: `O representante não está mais no servidor (${guildDoc.representative})`,
            ephemeral: true,
        });

        guildDoc.pending = false;
        await guildDoc.save();

        const message = await guildMember.send({ content: `Parabéns, o seu servidor \`${guildDoc.name}\` foi aprovado na EPF!` }).catch(() => null);
        if (!message) await interaction.reply({ content: "Não foi possível entrar em contato com o representante do servidor", ephemeral: true });

        embed.setColor('#58e600').setTitle("Formulário Aprovado");
        await interaction.message.edit({ embeds: [embed], components: [] });

        await interaction[interaction.replied || interaction.deferred ? 'followUp' : 'reply']({ content: "Servidor Aprovado", ephemeral: true });
    }
}