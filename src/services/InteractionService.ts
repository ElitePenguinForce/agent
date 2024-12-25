import type { Interaction } from "discord.js";
import AutocompleteService from "./AutocompleteService.js";
import CommandService from "./CommandService.js";
import ComponentsService from "./ComponentsService.js";
import ContextService from "./ContextService.js";
import ModalService from "./ModalService.js";

class InteractionService {
  public handleInteraction(interaction: Interaction) {
    if (interaction.isModalSubmit()) {
      return ModalService.handleModalInteraction(interaction);
    }

    if (interaction.isChatInputCommand()) {
      return CommandService.handleCommandInteraction(interaction);
    }

    if (interaction.isContextMenuCommand()) {
      return ContextService.handleContextInteraction(interaction);
    }

    if (interaction.isAutocomplete()) {
      return AutocompleteService.handleAutocompleteInteraction(interaction);
    }

    if (interaction.isMessageComponent()) {
      return ComponentsService.handleComponentInteraction(interaction);
    }
  }
}

export default new InteractionService();
