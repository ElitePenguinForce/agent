import type { ClientEvents } from "discord.js";
import type { DiscordEvent } from "../../shared/types/event.js";

export default function createEvent<T extends keyof ClientEvents>(event: {
  /**
   * @description The name of the event
   */
  name: T;
  /**
   * @description The function to execute the event
   */
  execute: (...args: ClientEvents[T]) => Promise<unknown> | unknown;
}): DiscordEvent<T> {
  return event;
}
