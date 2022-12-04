module.exports = async (client) => {
    const constantsModel = require('../models/constants');
    let constants = await constantsModel.findOne({});
    if (!constants.updateLogs?.length) return;
    const config = require('../config');
    await client.channels.cache.get(config.guildsChangeLog)?.send({
        content: constants.updateLogs.join('\n'),
        allowedMentions: { roles: [], users: [] },
    });
    constants.updateLogs = [];
    await constants.save();
};
