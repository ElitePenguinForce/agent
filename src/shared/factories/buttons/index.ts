import {
  ButtonStyle,
  type CacheType,
  type ComponentEmojiResolvable,
  ComponentType,
  parseEmoji,
} from "discord.js";
import type { Component, ComponentExecute } from "../../types/components.js";

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

type Props<C extends CacheType> = {
  id: string;
  create: () => Omit<ButtonComponentData, "customId">;
  execute: ComponentExecute<"button", C>;
};

function isButtonWithURL(
  data: Omit<ButtonComponentData, "customId">,
): data is LinkButtonComponentData {
  return "url" in data && typeof data.url === "string";
}

export default function createButton<C extends CacheType = "cached">(
  props: Props<C>,
): Component<"button", C> {
  return {
    ...props,
    type: "button",
    // @ts-expect-error - skill issue
    create: (...args: T) => {
      const data = props.create();

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
        custom_id: args.length ? `${props.id}:${args.join(":")}` : props.id,
        style:
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
