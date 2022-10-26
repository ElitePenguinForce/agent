const fs = require('fs');
const path = require('path');

module.exports = async client => {
    fs.readdirSync(path.join('..', 'events')).filter(file => file.endsWith(".js")).forEach(file => {
        const event = require(`../events/${file}`);
        client[event.once ? 'once' : 'on'](event.name, (...args) => event.execute(...args, client));
    });
}