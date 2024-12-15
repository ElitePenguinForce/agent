import type {
  APIButtonComponent,
  ButtonInteraction,
  CacheType,
} from "discord.js";

type ComponentType = "button";
type ComponentData<T extends ComponentType> = T extends "button"
  ? APIButtonComponent
  : undefined;
type ComponentInteraction<T extends ComponentType> = T extends "button"
  ? ButtonInteraction
  : never;
export type ComponentExecute<
  T extends ComponentType,
  C extends CacheType = "cached",
> = T extends "button"
  ? (interaction: ButtonInteraction<C>) => Promise<unknown> | unknown
  : never;

export type Component<
  T extends ComponentType,
  C extends CacheType = "cached",
> = {
  id: string;
  create: (...args: (string | number | boolean)[]) => ComponentData<T>;
  execute: ComponentExecute<T, C>;
};
