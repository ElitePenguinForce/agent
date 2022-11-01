
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
            const guildModel = require('../../models/guild.js');
            const guildExists = await guildModel.exists({_id: fetchedInvite.guild.id});
            if(guildExists) errors.push("Esse servidor já faz parte da EPF");
            if (fetchedInvite.guild.memberCount < 5000) errors.push("O servidor não atingiu os requisitos mínimos");
        }
        if (!parsedRole) errors.push(`Cargo Inválido (${roleInput})`);

        const aproveChannel = client.channels.cache.get(config.aproveChannel);
        
        if (errors.length) {
            const embed = new EmbedBuilder()
                .setTitle("Formulário Recusado")
                .setColor("#d12c2c")
                .setFields([
                    { name: "Enviado por", value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                    { name: "Link permanente do servidor", value: `${fetchedInvite?.url || "Inválido"}`, inline: true },
                    { name: "Cargo Principal no Servidor", value: `${parsedRole || "Inválido"}`, inline: true },
                    { name: "Sobre o servidor", value: `${serverAbout}`, inline: false },
                    { name: "Por onde conheceu a EPF", value: `${epfAbout}`, inline: false },
                    { name: "Recusado pelo Motivo", value: `${errors.join("\n")}`, inline: true },
                    { name: "Recusado por", value: `${client.user} (${client.user.id})`, inline: true }
                ]);

            await interaction.member.send({ content: `O seu servidor foi recusado automaticamente pelo seguinte motivo:\n${errors.join("\n")}`, ephemeral: true }).catch(() => null);
            
            return await aproveChannel.send({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setTitle(`Novo formulário`)
            .setColor('#fccf03')
            .setFields([
                { name: "Enviado por", value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                { name: "Link permanente do servidor", value: `${fetchedInvite?.url || "Inválido"}`, inline: true },
                { name: "Cargo Principal no Servidor", value: `${parsedRole || "Inválido"}`, inline: true },
                { name: "Sobre o servidor", value: `${serverAbout}`, inline: false },
                { name: "Por onde conheceu a EPF", value: `${epfAbout}`, inline: false }
            ]);

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

        await aproveChannel.send({embeds: [embed], components: [row]});
    }
}