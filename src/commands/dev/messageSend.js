const { SlashCommandBuilder, EmbedBuilder, SelectMenuBuilder, ActionRowBuilder, SelectMenuOptionBuilder, PermissionFlagsBits, PermissionsBitField, ButtonBuilder, ButtonStyle   } = require ('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('messagesend')
    .setDescription('Permissões elevadas requisitadas para a execução do comando'),
    async execute(interaction, client) {
        if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const embed1 = new EmbedBuilder()
        .setTitle(`👋 Opa, tudo bem?`)
        .setDescription(`Antes de tudo, é muito importante te explicar o que é, e qual o principal objetivo da **EPF**.\nNosso servidor tem a função de juntar o máximo de moderadores, administradores e pessoas que dedicam seus tempo à uma comunidade do Discord. Essa junção tem o propósito de reunir informações úteis para todos, basicamente uma troca de conhecimento.`)
        .setColor('#fccf03')

        const embed2 = new EmbedBuilder()
        .setTitle(`🗣️ "O servidor é público?"`)
        .setDescription(`Inicialmente, a comunidade era "fechada" apenas para convites e/ou recomendações, feitas por pessoas da equipe da EPF.\nAcabamos percebendo que isso deixava muitas pessoas de fora por não terem contato com pessoas que estavam dentro, mesmo cumprindo com os requisitos. E por isso, decidimos deixar a entrada aberta à todos por meio de um formulário de solicitação.`)
        .setColor('#fccf03')

        const embed3 = new EmbedBuilder()
        .setTitle(`<:epf:1005368163761917982> Como representar seu servidor na EPF`)
        .setDescription(`<:dot:1005368603182374972> **Requisitos mínimos para a entrada:**\n<:barra2:1005368623969353778> Participar do "[Descobrir](https://support.discord.com/hc/pt-br/articles/360023968311-Server-Discovery)";\n<:barra2:1005368623969353778> Servidor limpo de mensagens essencialmente inapropriadas;\n<:barra2:1005368623969353778> Seu servidor deve cumprir com os [TOS](https://discord.com/terms) e [Guidelines](https://discord.com/guidelines);\n<:barra2:1005368623969353778> Todos da equipe do servidor devem seguir com as regras do seu servidor;\n<:barra1:1005368679350931546> Seu servidor deve conter no mínimo 3.000 membros.\n\n*Caso você cumpra com os requisitos acima, realize o formulário baixo*`)
        .setColor('#fccf03')

        const menu = new SelectMenuBuilder()
        .setCustomId(`form-menu`)
        .setOptions(new SelectMenuOptionBuilder({
            label: `Realizar formulário`,
            value: `Formulário`
        }));

        const button = new ButtonBuilder()
        .setCustomId('form-button')
        .setLabel(`Solicitar entrada`)
        .setEmoji(`📫`)
        .setStyle(ButtonStyle.Secondary);
 
        await client.channels.cache.get('1003071655045775532').send({
            embeds: [embed1, embed2, embed3],
            components: [new ActionRowBuilder().addComponents(button)]
            //components: [new ActionRowBuilder().addComponents(menu)]
        });
        await interaction.reply({ content: `Sucesso!`, ephemeral: true})
    } else{
        await interaction.reply({
            content: `Sem permissão`,
            ephemeral: true
        });
    }
    }
}