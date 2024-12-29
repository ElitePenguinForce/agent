import {
  type CacheType,
  ComponentType,
  type ModalActionRowComponentData,
} from "discord.js";
import type { Component, ComponentExecute } from "../types/components.js";

type Props<T extends CacheType = "cached"> = {
  data: {
    customId: string;
    title: string;
    components: ModalActionRowComponentData[];
  };
  execute: ComponentExecute<"modal", T>;
};

export default function createModal<T extends CacheType = "cached">(
  props: Props<T>,
): Component<"modal", T> {
  return {
    id: props.data.customId,
    type: "modal",
    create(...args) {
      return {
        customId: args.length
          ? `${props.data.customId}:${args.join(":")}`
          : props.data.customId,
        title: props.data.title,
        components: props.data.components.map((component) => ({
          type: ComponentType.ActionRow,
          components: [component],
        })),
      };
    },
    execute: props.execute,
  };
}
