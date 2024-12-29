import type { Interaction } from "discord.js";
import CommandService from "./CommandService.js";
import ComponentsService from "./ComponentsService.js";
import ContextService from "./ContextService.js";

class InteractionService {
  public handleInteraction(interaction: Interaction) {
    if (interaction.isChatInputCommand()) {
      return CommandService.handleCommandInteraction(interaction);
    }

    if (interaction.isContextMenuCommand()) {
      return ContextService.handleContextInteraction(interaction);
    }

    if (interaction.isAutocomplete()) {
      return CommandService.handleAutocompleteInteraction(interaction);
    }

    if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
      return ComponentsService.handleComponentInteraction(interaction);
    }
  }
}

export default new InteractionService();
