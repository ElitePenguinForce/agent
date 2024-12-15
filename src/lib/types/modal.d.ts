import type {
  CacheType,
  ModalComponentData,
  ModalSubmitInteraction,
} from "discord.js";

export type ModalExecute<T extends CacheType> = (
  interaction: ModalSubmitInteraction<T>,
) => Promise<unknown> | unknown;

export type Modal<T extends CacheType = "cached"> = {
  data: ModalComponentData;
  execute: ModalExecute<T>;
};
