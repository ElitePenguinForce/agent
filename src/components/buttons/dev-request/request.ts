import { ButtonStyle } from "discord.js";
import createButton from "../../../factories/button.js";
import config from "../../../config.js";
import devRoleRequestModal from "../../../modals/dev/role-request.js";

export default createButton({
  id: "request-dev-role-form",
  create: (id) => {
    return {
      customId: id,
      style: ButtonStyle.Secondary,
      label: "Formulário de Desenvolvedor",
      emoji: config.forms.dev.emoji,
    };
  },
  async execute(interaction) {
    return interaction.showModal(devRoleRequestModal.data);
  },
});
