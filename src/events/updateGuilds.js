let timeout;

module.exports = {
  name: 'updateGuilds',
  execute: async (forceUpdate = false, client) => {
    const constantsModel = require('../models/constants');
    let constants = await constantsModel.getConstants();

    if (constants.scheduledUpdate && !forceUpdate) return;
    
    const timeDifference = Date.now() - constants.lastGuildsChannelUpdate;
    
    let updateGuildsChannel = require("../utils/updateGuildsChannel");

    if ((timeDifference > 600000) || forceUpdate) {
      try {
        if (forceUpdate) {
          await constantsModel.updateConstants({ scheduledUpdate: false });
          clearTimeout(timeout);
        }
        await updateGuildsChannel(client);
      } catch(err) {
        console.log(err)
      }
      return;
    }

    await constantsModel.updateConstants({ scheduledUpdate: true });
    
    timeout = setTimeout(async () => {
      try {
        await updateGuildsChannel(client);
      } catch(err) {
        console.log(err);
      } finally {
        await constantsModel.updateConstants({ scheduledUpdate: false });
      }
    }, 600000 - timeDifference)
  }
}