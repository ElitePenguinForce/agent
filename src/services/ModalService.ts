import type { Interaction, ModalSubmitInteraction } from "discord.js";
import { getJavascriptPaths, importUsingRoot } from "../shared/helpers/path.js";
import safeCall from "../shared/helpers/safeCall.js";
import type { Modal } from "../shared/types/modal.js";

class ModalService {
  private modals: Map<string, Modal> = new Map();

  private validateModalImport(
    modal: unknown,
    path: string,
  ): asserts modal is Modal {
    if (
      typeof modal !== "object" ||
      modal === null ||
      !("data" in modal) ||
      !("execute" in modal)
    ) {
      throw new Error(`Import ${path} is not a valid modal`);
    }
  }

  public async load() {
    const paths = getJavascriptPaths("./dist/src/features/").filter((path) =>
      path.includes("/modals/"),
    );

    for (const path of paths) {
      const modal = (await importUsingRoot(path)).default;
      this.validateModalImport(modal, path);
      this.modals.set(modal.data.customId, modal);
    }
  }

  public getModal(customId: string) {
    return this.modals.get(customId);
  }

  public getModals() {
    return Array.from(this.modals.values());
  }

  public async handleModalInteraction(interaction: Interaction) {
    if (!interaction.isModalSubmit()) {
      return;
    }

    const modal = this.getModal(interaction.customId);
    if (!modal) {
      return;
    }

    safeCall(modal.execute, interaction as ModalSubmitInteraction<"cached">);
  }
}

export default new ModalService();
