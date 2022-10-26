const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const fs = require('fs');
const path = require('path');
const config = require('../config.js');

module.exports = async client => {
    commandArray = [];
    fs.readdirSync(path.join('..', 'commands')).filter(file => file.endsWith('.js')).forEach(file => {
        const command = require(`../commands/${file}`);
        if(!command.active) return;
        client.commands.set(command.data.name, command);
        commandArray.push(command.data.toJSON());
        console.log(`Command: ${command.data.name} has been passed through the handler`);
    });
    const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('Reiniciando comandos')

        await rest.put(
            Routes.applicationGuildCommands(config.agent, config.guild), {
                body: commandArray,
            });
        console.log('Comandos reiniciados');
    } catch (error) {
        console.error(error);
    }
}