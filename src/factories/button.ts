import {
  ButtonStyle,
  ComponentType,
  parseEmoji,
  type ComponentEmojiResolvable,
} from "discord.js";
import type { Component, ComponentExecute } from "../lib/types/components.js";

type BaseButtonComponentData = {
  style: ButtonStyle;
  disabled?: boolean;
  emoji?: ComponentEmojiResolvable;
  label?: string;
};

type LinkButtonComponentData = {
  style: ButtonStyle.Link;
  url: string;
} & BaseButtonComponentData;

type InteractionButtonComponentData = {
  style: Exclude<ButtonStyle, ButtonStyle.Link>;
  customId: string;
} & BaseButtonComponentData;

type ButtonComponentData =
  | LinkButtonComponentData
  | InteractionButtonComponentData;

type Props = {
  id: string;
  create: (
    id: string,
    ...args: (string | number | boolean)[]
  ) => ButtonComponentData;
  execute: ComponentExecute<"button">;
};

function isButtonWithURL(
  data: ButtonComponentData,
): data is LinkButtonComponentData {
  return "url" in data && typeof data.url === "string";
}

export default function createButton(props: Props): Component<"button"> {
  return {
    ...props,
    // @ts-expect-error - skill issue
    create: (...args) => {
      const data = props.create(props.id, ...args);

      if (isButtonWithURL(data)) {
        return {
          url: data.url,
          style: ButtonStyle.Link,
          disabled: data.disabled,
          emoji:
            typeof data.emoji === "string"
              ? parseEmoji(data.emoji) || undefined
              : data.emoji,
          label: data.label,
          type: ComponentType.Button,
        };
      }

      return {
        custom_id: data.customId,
        style:
          // @ts-expect-error - it can, by dev's skill issue, have a link style but it's not a link button
          data.style === ButtonStyle.Link ? ButtonStyle.Secondary : data.style,
        disabled: data.disabled,
        emoji:
          typeof data.emoji === "string"
            ? parseEmoji(data.emoji) || undefined
            : data.emoji,
        label: data.label,
        type: ComponentType.Button,
      };
    },
    execute: props.execute,
  };
}
