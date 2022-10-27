const config = require("../config");

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log (`Logado em ${client.user.tag} (${client.user.id})`);
        const guild = client.guilds.cache.get(config.guild);
        await guild.members.fetch();
        await guild.commands.fetch();
    }
}