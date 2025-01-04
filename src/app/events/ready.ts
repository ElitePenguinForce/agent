import Constants from "../../core/db/models/constants.js";
import BackgroundTasksService from "../../services/BackgroundTasksService.js";
import createEvent from "../../shared/factories/event.js";
import checkFormMessages from "../../shared/helpers/checkFormMessages.js";

export default createEvent({
  name: "ready",
  execute: async (client) => {
    console.log(`Logado em ${client.user.username} (${client.user.id})`);

    // se crashar ou reiniciar no meio de uma atualização, ele vai refazer essa atualização já
    // que a ela não foi finalizada devidamente
    const constants = await Constants.getConstants();
    if (constants.updatingGuildsChannel || constants.scheduledUpdate) {
      await Constants.updateConstants({
        updatingGuildsChannel: false,
        scheduledUpdate: false,
      });
      client.updateServersData(
        [
          "<:e_repeat:1049017561175568404> **|** A última atualização não foi bem sucedida, por isso será refeita",
        ],
        true,
      );
    }

    await checkFormMessages(client);

    BackgroundTasksService.initTasks(client);
  },
});
