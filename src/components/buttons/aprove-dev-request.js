const { EmbedBuilder, parseWebhookURL } = require("discord.js");
const config = require('../../config');

module.exports = {
    data: {
        name: "aprove-dev-request"
    },

    async execute(interaction, client) {
        const member = await interaction.guild.members.fetch(interaction.customId.split(":")[1]).catch(() => null);
        
        if (member) await member.roles.add(config.devID);
        else return interaction[interaction.replied || interaction.deferred ? 'followUp' : 'reply']({ content: "Membro não encontrado... Não consegui dar o cargo à ele", ephemeral: true });

        await interaction.deferReply({ ephemeral: true });

        const embed = EmbedBuilder.from(interaction.message.embeds[0]);

        const message = await member.send({ content: `Parabéns, você foi aprovado e está apto para receber o cargo de Developer no EPF!` }).catch(() => null);
        if (!message) await interaction.followUp({ content: "Não foi possível entrar em contato com o requisitante do cargo", ephemeral: true });

        embed.setColor('#58e600').setTitle("Formulário Aprovado - Developer");
        await interaction.message.edit({ embeds: [embed], components: [] });

        await interaction.message.thread.setArchived(true);

        await interaction.followUp({ content: "Desenvolvedor Aprovado", ephemeral: true });
    
        const webhook = parseWebhookURL(process.env.OFFTOPIC_WEBHOOK);
        await interaction.client.fetchWebhook(webhook.id, webhook.token)
            .then(async (webhook) => {
                await webhook.send({
                    content: `<:icons_djoin:875754472834469948> O membro ${member} foi aprovado como desenvolvedor na EPF`,
                    username: interaction.guild.name,
                    avatarURL: interaction.guild.iconURL(),
                    allowedMentions: {
                    users: []
                    }
                })
            });
    }
}
