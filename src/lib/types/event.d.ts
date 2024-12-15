import type { Awaitable, ClientEvents } from "discord.js";

export type DiscordEvent<T extends keyof ClientEvents = keyof ClientEvents> = {
  name: T;
  execute: (...args: ClientEvents[T]) => Awaitable<unknown>;
};
