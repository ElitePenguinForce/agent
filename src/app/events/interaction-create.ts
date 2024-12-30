import InteractionService from "../../services/InteractionService.js";
import createEvent from "../../shared/factories/event.js";

export default createEvent({
  name: "interactionCreate",
  async execute(interaction) {
    await InteractionService.handleInteraction(interaction);
  },
});
