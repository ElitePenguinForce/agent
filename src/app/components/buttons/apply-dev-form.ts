import { ButtonStyle } from "discord.js";
import config from "../../../core/config/index.js";
import createButton from "../../../shared/factories/buttons/index.js";
import devRoleRequestModal from "../modals/dev-form.js";

export default createButton({
  id: "request-dev-role-form",
  create: () => {
    return {
      style: ButtonStyle.Secondary,
      label: "Formulário de Desenvolvedor",
      emoji: config.forms.dev.emoji,
    };
  },
  async execute(interaction) {
    return interaction.showModal(devRoleRequestModal.data);
  },
});
