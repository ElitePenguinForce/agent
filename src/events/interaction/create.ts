import createEvent from "../../factories/event.js";
import handleAutocompleteInteraction from "../../lib/interactions/autocomplete.js";
import handleButtonInteraction from "../../lib/interactions/button.js";
import handleChatInputInteraction from "../../lib/interactions/chat-input.js";
import handleContextInteraction from "../../lib/interactions/context.js";
import handleModalSubmitInteraction from "../../lib/interactions/modal.js";

export default createEvent({
  name: "interactionCreate",
  execute: async (interaction) => {
    if (
      (interaction.isMessageComponent() || interaction.isModalSubmit()) &&
      interaction.customId.startsWith("collector")
    ) {
      return;
    }

    try {
      if (interaction.inRawGuild()) {
        await interaction.client.guilds
          .fetch(interaction.guildId)
          .catch(() => null);
      }

      if (interaction.isChatInputCommand()) {
        await handleChatInputInteraction(interaction);
        return;
      }

      if (interaction.isModalSubmit()) {
        await handleModalSubmitInteraction(interaction);
        return;
      }

      if (interaction.isButton()) {
        await handleButtonInteraction(interaction);
        return;
      }

      if (interaction.isAutocomplete()) {
        await handleAutocompleteInteraction(interaction);
        return;
      }

      if (interaction.isContextMenuCommand()) {
        await handleContextInteraction(interaction);
        return;
      }
    } catch (error) {
      console.error(error);
    }
  },
});
