const { ButtonBuilder, ModalBuilder, EmbedBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ButtonStyle } = require ('discord.js');

module.exports = {
    data: {
        name: `form-button`
    },
    async execute(interaction, client) {
        const confirmationEmbed = new EmbedBuilder()
            .setTitle("Leia antes de continuar")
            .setDescription("Ao confirmar, você concorda que você será o representante do servidor dentro da EPF (Elite Penguin Force). E que a responsabilidade da sua staff dentro do nosso servidor será inteiramente sua.")
            .setColor("#00000000");
        
        const row = new ActionRowBuilder()
            .setComponents(
                new ButtonBuilder()
                    .setCustomId("collector:confirm")
                    .setLabel("Confirmar")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId("collector:cancel")
                    .setLabel("Cancelar")
                    .setStyle(ButtonStyle.Danger)
            );
        
        const reply = await interaction.reply({ embeds: [confirmationEmbed], components: [row], ephemeral: true, fetchReply: true });

        const filter = (i) => i.user.id === interaction.user.id;
        const collector = reply.createMessageComponentCollector({
            filter,
            time: 60000
        });

        collector.on("collect", async (i) => {
            if (i.customId === "collector:confirm") {
                const modal = new ModalBuilder()
                    .setCustomId(`serverRequestModal`)
                    .setTitle(`Elite Penguin Force`)

                const serverLink = new TextInputBuilder()
                    .setCustomId(`serverLink`)
                    .setLabel(`Link permanente do servidor`)
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short)
                    .setMinLength(10)
                    .setMaxLength(30);

                const serverRole = new TextInputBuilder()
                    .setCustomId(`serverRole`)
                    .setLabel(`Qual o seu cargo nesse servidor?`)
                    .setRequired(true)
                    .setPlaceholder("( mod | adm | dono )")
                    .setStyle(TextInputStyle.Paragraph)
                    .setMinLength(3)
                    .setMaxLength(4);

                const serverAbout = new TextInputBuilder()
                    .setCustomId(`serverAbout`)
                    .setLabel(`Conte-nos mais sobre esse servidor`)
                    .setRequired(true)
                    .setStyle(TextInputStyle.Paragraph)
                    .setMinLength(20)
                    .setMaxLength(150);

                const epfAbout = new TextInputBuilder()
                    .setCustomId(`epfAbout`)
                    .setLabel(`Por onde você conheceu a EPF?`)
                    .setRequired(true)
                    .setStyle(TextInputStyle.Paragraph)
                    .setMinLength(20)
                    .setMaxLength(150);

                modal.addComponents(new ActionRowBuilder().addComponents(serverLink));
                modal.addComponents(new ActionRowBuilder().addComponents(serverRole));
                modal.addComponents(new ActionRowBuilder().addComponents(serverAbout));
                modal.addComponents(new ActionRowBuilder().addComponents(epfAbout));

                return i.showModal(modal);
            }

            await i.deferUpdate();
            return i.deleteReply();
        });
    }
}