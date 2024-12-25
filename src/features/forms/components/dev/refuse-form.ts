import { ButtonStyle } from "discord.js";
import refuseRequestModal from "../../modals/dev/refuse-dev-request.js";
import createButton from "../../../../shared/factories/buttons/index.js";

export default createButton({
  id: "refuse-dev-request",
  create: () => {
    return {
      label: "Recusar",
      style: ButtonStyle.Danger,
    };
  },
  async execute(interaction) {
    await interaction.showModal(refuseRequestModal.data);
  },
});
