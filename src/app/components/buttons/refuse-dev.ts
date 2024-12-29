import { ButtonStyle } from "discord.js";
import createButton from "../../../shared/factories/buttons/index.js";
import refuseRequestModal from "../modals/refuse-dev-reason.js";

export default createButton({
  id: "refuse-dev-request",
  create: () => {
    return {
      label: "Recusar",
      style: ButtonStyle.Danger,
    };
  },
  async execute(interaction) {
    return interaction.showModal(refuseRequestModal.create());
  },
});
