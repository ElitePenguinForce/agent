import { CommandContext, MenuCommandContext } from "seyfert";
import { MessageFlags } from "seyfert/lib/types";

export default function onMiddlewaresError(
  context: CommandContext | MenuCommandContext<any, never>,
  error: string,
) {
  return context.editOrReply({
    content: error,
    flags: MessageFlags.Ephemeral,
  });
}
