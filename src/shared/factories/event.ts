import type { ClientEvents } from "discord.js";
import type { DiscordEvent } from "../../shared/types/event.js";

export default function createEvent<T extends keyof ClientEvents>(event: {
  name: T;
  execute: (...args: ClientEvents[T]) => Promise<unknown> | unknown;
}): DiscordEvent<T> {
  return event;
}
