import { ButtonStyle } from "discord.js";
import createButton from "../../../factories/button.js";
import refuseServerRequest from "../../../modals/server/refuse-request.js";

export default createButton({
  id: "refuse-server-form",
  create: (id, guildId) => {
    return {
      customId: `${id}:${guildId}`,
      label: "Recusar",
      style: ButtonStyle.Danger,
    };
  },
  async execute(interaction) {
    return interaction.showModal(refuseServerRequest.data);
  },
});
