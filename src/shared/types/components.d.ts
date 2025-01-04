import type {
  APIButtonComponent,
  ButtonInteraction,
  CacheType,
  ModalComponentData,
  ModalSubmitInteraction,
} from "discord.js";

type ComponentType = "button" | "modal";
type ComponentData<T extends ComponentType> = T extends "button"
  ? APIButtonComponent
  : T extends "modal"
    ? ModalComponentData
    : never;
type ComponentInteraction<
  T extends ComponentType,
  C extends CacheType,
> = T extends "button"
  ? ButtonInteraction<C>
  : T extends "modal"
    ? ModalSubmitInteraction<C>
    : never;
export type ComponentExecute<
  T extends ComponentType,
  C extends CacheType = "cached",
> = (
  interaction: ComponentInteraction<T, C>,
  ...args: string[]
) => Promise<unknown> | unknown;

export type Component<
  T extends ComponentType,
  C extends CacheType = "cached",
> = {
  id: string;
  type: T;
  create: (...args: (string | number | boolean)[]) => ComponentData<T>;
  execute: ComponentExecute<T, C>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyComponent = Component<any>;
