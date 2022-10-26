const { ModalSubmitFields, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = async client => {
    fs
        .readdirSync(path.join(__dirname, '..', 'components'))
        .forEach(folder => {
            client[folder] = fs
                .readdirSync(path.join(__dirname, '..', 'components', folder))
                .filter(file => file.endsWith('.js'))
                .map(file => require(`../components/${folder}/${file}`))
                .reduce((col, component) => col.set(component.data.name, component), new Collection());
        });
}