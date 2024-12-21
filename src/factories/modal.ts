import {
  ComponentType,
  type CacheType,
  type ModalActionRowComponentData,
} from "discord.js";
import type { Modal, ModalExecute } from "../lib/types/modal.js";

type Props<T extends CacheType = "cached"> = {
  data: {
    customId: string;
    title: string;
    components: ModalActionRowComponentData[];
  };
  execute: ModalExecute<T>;
};

export default function createModal<T extends CacheType = "cached">(
  props: Props<T>,
): Modal<T> {
  return {
    data: {
      ...props.data,
      components: props.data.components.map((component) => ({
        type: ComponentType.ActionRow,
        components: [component],
      })),
    },
    execute: props.execute,
  };
}
