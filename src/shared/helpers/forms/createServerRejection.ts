import type { ModalSubmitInteraction } from "discord.js";
import config from "../../../core/config/index.js";
import { autoRejectEmbed } from "../../factories/embeds/autoRejectGuild.js";
import parseMemberRole from "./parseMemberRole.js";

/**
 * Creates a server rejection
 *
 * Sends a message to the user and sends an embed to the approve channel
 *
 * @param interaction The interaction that triggered the rejection
 * @param errors The errors that caused the rejection
 */
export default async function createServerRejection(
  interaction: ModalSubmitInteraction<"cached">,
  errors: string[],
) {
  const role = interaction.fields.getTextInputValue("serverRole");
  const parsedRole = parseMemberRole(role);

  const serverAbout = interaction.fields.getTextInputValue("serverAbout");
  const epfAbout = interaction.fields.getTextInputValue("epfAbout");

  await interaction.member
    .send({
      content: `O seu servidor foi recusado automaticamente pelo seguinte motivo:\n${errors.join(
        "\n",
      )}`,
    })
    .catch(() => null);
  await interaction.reply({
    ephemeral: true,
    content:
      "Seu servidor foi rejeitado devido a um erro no formulário, consulte sua DM para mais informações, caso sua DM seja privada sugerimos que deixe ela pública para receber novas informaçòes vindas do nosso bot Agent",
  });

  const approveChannel = interaction.client.channels.cache.get(
    config.ids.channels.approve,
  );

  if (approveChannel?.isSendable()) {
    const embed = autoRejectEmbed({
      sender: interaction.user,
      epfAbout,
      serverAbout,
      errors,
      role: parsedRole,
    });

    await approveChannel.send({ embeds: [embed] });
  }

  return;
}
