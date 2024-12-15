import { ButtonStyle } from "discord.js";
import createButton from "../../../factories/button.js";
import refuseRequestModal from "../../../modals/dev/refuse-request.js";

export default createButton({
  id: "refuse-dev-request",
  create: (id, userId) => {
    if (!userId) {
      throw new Error("userId is required in refuse dev request button");
    }
    return {
      customId: `${id}:${userId}`,
      label: "Recusar",
      style: ButtonStyle.Danger,
    };
  },
  async execute(interaction) {
    await interaction.showModal(refuseRequestModal.data);
  },
});
