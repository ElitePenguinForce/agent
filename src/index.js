require('./database.js');

const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js')
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    partials: [Partials.GuildMember, Partials.Channel],
    allowedMentions: {repliedUser: false},
});
client.commands = new Collection();

const handlerFiles = fs.readdirSync(path.join(__dirname, 'handlers')).filter(file => file.endsWith('.js'));

(async () => {
    for(const file of handlerFiles) await require(`./handlers/${file}`)(client);
    
    await client.login();
})();