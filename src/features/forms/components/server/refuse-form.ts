import { ButtonStyle } from "discord.js";
import refuseServerRequest from "../../modals/server/refuse-form-reason.js";
import createButton from "../../../../shared/factories/buttons/index.js";

export default createButton({
  id: "refuse-server-form",
  create: () => {
    return {
      label: "Recusar",
      style: ButtonStyle.Danger,
    };
  },
  async execute(interaction) {
    return interaction.showModal(refuseServerRequest.data);
  },
});
