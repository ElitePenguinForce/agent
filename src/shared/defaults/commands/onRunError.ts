import { CommandContext, MenuCommandContext } from "seyfert";
import { MessageFlags } from "seyfert/lib/types";
import CommandRuntimeError from "../../errors/CommandRuntimeError";

export default function onRunError(
  context: CommandContext | MenuCommandContext<any, never>,
  error: unknown,
) {
  if (error instanceof CommandRuntimeError) {
    return context.editOrReply({
      content: error.message,
      flags: MessageFlags.Ephemeral,
    });
  }

  context.client.logger.error(error);

  return context.editOrReply({
    content: "Ocorreu um erro ao executar o comando",
    flags: MessageFlags.Ephemeral,
  });
}
