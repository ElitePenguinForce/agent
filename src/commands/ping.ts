import {
  Command,
  CommandContext,
  Declare
} from "seyfert";

@Declare({
  name: "ping",
  description: "Show the bot's latency",
  contexts: ["Guild"],
})
export default class PingCommand extends Command {
  override async run(context: CommandContext) {
    const latency = context.client.gateway.latency;
    await context.write({
      embeds: [
        {
          description: `Latency: ${latency}ms`,
        },
      ],
    });
  }
}
