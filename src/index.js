require("dotenv").config();
const { Client, Collection, GatewayIntentBits } = require('discord.js')
const fs = require('fs');
const path = require('path');


const client = new Client({ intents: GatewayIntentBits.Guilds });
client.commands = new Collection();


const handlerFiles = fs.readdirSync(path.join(__dirname, 'handlers')).filter(file => file.endsWith('.js'));

(async () => {
    for(const file of handlerFiles) await require(`./handlers/${folder}/${file}`)(client);
    
    await client.login();
})();