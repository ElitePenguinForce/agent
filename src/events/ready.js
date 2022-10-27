const config = require("../config");

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log (`Logado em ${client.user.tag} (${client.user.id})`);
        await client.guilds.cache.get(config.guild).members.fetch();
    }
}