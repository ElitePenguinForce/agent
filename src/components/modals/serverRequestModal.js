
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require ('discord.js')
const config = require('../../config');

module.exports = {
    data: {
        name: `serverRequestModal`
    },
    
    async execute(interaction, client) {
        const userEmbed = new EmbedBuilder()
            .setTitle(`Formulário enviado`)
            .setDescription(`Sua solicitação foi enviada com sucesso\n\nFazer esse formulário **não** garante a entrada da sua comunidade na EPF. \nSua requisição passará por uma analise e a equipe determinará se seu servidor está apto ou não.`)
            .setColor('#fccf03')

        await interaction.reply({
            embeds: [userEmbed],
            ephemeral: true
        });

        const inviteInput = interaction.fields.getTextInputValue("serverLink");
        const fetchedInvite = await client.fetchInvite(inviteInput)
            .then((invite) => invite)
            .catch(() => null);
        
        const roleInput = interaction.fields.getTextInputValue("serverRole").toLowerCase();
        const parsedRole = roleInput === 'mod' ? 'Moderador' : roleInput === 'adm' ? 'Administrador' : roleInput === 'dono' ? 'Dono' : null;
        
        const serverAbout = interaction.fields.getTextInputValue("serverAbout");
        const epfAbout = interaction.fields.getTextInputValue("epfAbout");
        
        const errors = [];
        
        if (!fetchedInvite) errors.push("Convite Inválido");
        else {
            if (fetchedInvite._expiresTimestamp) errors.push("Convite Expirável");
            if (fetchedInvite.maxUses) errors.push("Convite com limite de uso");
        }
        if (!parsedRole) errors.push(`Cargo Inválido (${roleInput})`);

        const aproveChannel = client.channels.cache.get(config.aproveChannel);
        
        if (errors.length) {
            const embed = new EmbedBuilder()
                .setTitle("Formulário Recusado")
                .setColor("#d12c2c")
                .setDescription(`**Enviado por:** ${interaction.user.tag} (${interaction.user.id})\n\n\n**Link permanente do servidor**\n"${fetchedInvite?.url || "Inválido"}"\n\n**Qual o seu cargo no servidor?**\n"${parsedRole || "Inválido"}"\n\n**Conte-nos mais sobre esse servidor.**\n"${serverAbout}"\n\n**Por onde você conheceu a EPF?**\n"${epfAbout}"`)
                .setFields([
                    { name: "Recusado pelo Motivo", value: `${errors.join("\n")}`, inline: true },
                    { name: "Recusado por", value: `${client.user} (${client.user.id})`, inline: true }
                ]);
            
            return aproveChannel.send({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setTitle(`Novo formulário`)
            .setColor('#fccf03')
            .setFooter({ text: `${fetchedInvite.guild.id}` })
            .setDescription(`**Enviado por:** ${interaction.user.tag} (${interaction.user.id})\n\n\n**Link permanente do servidor**\n"${fetchedInvite.url}"\n\n}"\n\n**Qual o seu cargo no servidor?**\n"${parsedRole}"\n\n**Conte-nos mais sobre esse servidor.**\n"${serverAbout}"\n\n**Por onde você conheceu a EPF?**\n"${epfAbout}"`)

        const row = new ActionRowBuilder()
            .setComponents(
                new ButtonBuilder()
                    .setCustomId("aprove-form")
                    .setLabel("Aprovar")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId("refuse-form")
                    .setLabel("Recusar")
                    .setStyle(ButtonStyle.Danger),
            );

        aproveChannel.send({embeds: [embed], components: [row]});
    }
}