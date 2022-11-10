let timeout;

module.exports = {
  name: 'guildUpdate',
  execute: async (client) => {
    if (timeout !== null) return;

    const constantsModel = require('../models/constants');
    let constants = await constantsModel.getConstants();
    
    const timeDifference = Date.now() - constants.lastGuildsChannelUpdate;
    
    let updateGuildsChannel = require("../utils/updateGuildsChannel");

    if (timeDifference > 600000) {
      try {
        await updateGuildsChannel(client);
      } catch(err) {
        console.log(err)
      }
      return;
    }
    
    timeout = setTimeout(async () => {
      try {
        await updateGuildsChannel(client);
      } catch(err) {
        console.log(err);
      } finally {
        timeout = null;
      }
    }, 600000 - timeDifference)
  }
}