import type { Client } from "discord.js";

export type Job = {
  data: {
    name: string;
    interval: number;
  };
  execute: (client: Client) => unknown | Promise<unknown>;
};
