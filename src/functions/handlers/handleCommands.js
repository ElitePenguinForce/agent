const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const fs = require('fs');

module.exports = (client) => {
    client.handleCommands = async() =>{
        const commandFolders = fs.readdirSync('./src/commands');
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));
            
            const { commands, commandArray} = client;
            for (const file of commandFiles){
                const command = require(`../../commands/${folder}/${file}`);
                commands.set(command.data.name, command);
                commandArray.push(command.data.toJSON());
                console.log(`Command: ${command.data.name} has been passed through the handler`);
                
            }
        }

        const clientId = '1005619303078428693';
        const guildId = '1003071654148194354';
        const rest = new REST({ version: '9' }).setToken(process.env.token);
        try {
            console.log('Reiniciando comandos')

            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId), {
                    body: client.commandArray,
                });
            console.log('Comandos reiniciados');
        } catch (error) {
            console.error(error);
        }
    }
}