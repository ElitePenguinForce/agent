// Copyright (C) 2022  HordLawk & vitoUwu & PeterStark000

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

require('./database.js');

const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js')
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent],
    partials: [Partials.GuildMember, Partials.Channel, Partials.Message],
    allowedMentions: {repliedUser: false},
});
client.commands = new Collection();

const handlerFiles = fs.readdirSync(path.join(__dirname, 'handlers')).filter(file => file.endsWith('.js'));

(async () => {
    for(const file of handlerFiles) await require(`./handlers/${file}`)(client);
    
    await client.login();
})();