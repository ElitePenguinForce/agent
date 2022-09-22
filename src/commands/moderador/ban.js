const { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField, EmbedBuilder } = require ('discord.js')
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Permissões elevadas requisitadas para a execução do comando')
    .addUserOption(option => option.setName('user').setDescription('Usuário que você vai banir').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Motivo').setRequired(true)),

    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id) || (await interaction.guild.members.fetch(user).catch(() => {}));
        const reason = interaction.options.getString('reason');
        const { roles } = interaction.member;
        const role = await interaction.guild.roles.fetch(config.agent | config.guard | config.master).catch(console.error);
        const bannedUser = await interaction.guild.bans.fetch(user.id).catch(() => { console.log() })
        const embed = new EmbedBuilder()
        .setTitle(`Banimento`)
        .setDescription(`**Usuário banido:** ${user}\n**Motivo:** ${reason}\n**Efetuado por:** ${interaction.user}`)
        .setColor('#fccf03')
        .setTimestamp(Date.now())
        .setThumbnail(user.avatarURL({dynamic: true, size: 512, extension: 'png'}))
    
        if (user.id === interaction.user.id) return interaction.reply({ content: `Você não pode usar esse comando em si mesmo`, ephemeral: true})
        if (user.id === client.user.id) return interaction.reply({ content: `Você não pode usar esse comando em mim`, ephemeral: true})

        if (interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            await interaction.deferReply({
                fetchReply: true,
                ephemeral: true
            });
            
            if (bannedUser) return interaction.editReply({ content: `${user.username} já está banido`, ephemeral: true})
            
            const banMember = await interaction.guild.bans.create(user.id, { reason: reason, deleteMessageDays: 7}).catch((err)=>{console.log(err)})
            if (!banMember) return interaction.editReply({ content: "Um erro ocorreu", ephemeral: true})
            
            await interaction.editReply({
                embeds: [embed]
            })
        } else {
            await interaction.reply({
                content: `Sem permissão`,
                ephemeral: true
            });
        }
    }
}