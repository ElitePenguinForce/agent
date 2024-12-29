import type { Client } from "discord.js";

export type Task = {
  data: {
    name: string;
    interval: number;
  };
  execute: (client: Client) => unknown | Promise<unknown>;
};
