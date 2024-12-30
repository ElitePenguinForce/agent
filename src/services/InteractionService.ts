import type { Interaction } from "discord.js";
import CommandService from "./CommandService.js";
import ComponentsService from "./ComponentsService.js";

/**
 * @description The service that handles the interactions
 */
class InteractionService {
  /**
   * @description Handles the incoming interaction
   *
   * @param interaction The interaction to handle
   */
  public async handleInteraction(interaction: Interaction) {
    try {
      if (interaction.isCommand()) {
        await CommandService.handleCommandInteraction(interaction);
        return;
      }

      if (interaction.isAutocomplete()) {
        await CommandService.handleAutocompleteInteraction(interaction);
        return;
      }

      if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
        await ComponentsService.handleComponentInteraction(interaction);
        return;
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @description Loads the interaction service, with the command and component services
   */
  public load() {
    return Promise.all([CommandService.load(), ComponentsService.load()]);
  }
}

export default new InteractionService();
