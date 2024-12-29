import { ButtonStyle } from "discord.js";
import createButton from "../../../shared/factories/buttons/index.js";
import refuseServerRequest from "../modals/refuse-server-reason.js";

export default createButton({
  id: "refuse-server-form",
  create: () => {
    return {
      label: "Recusar",
      style: ButtonStyle.Danger,
    };
  },
  async execute(interaction) {
    return interaction.showModal(refuseServerRequest.create());
  },
});
