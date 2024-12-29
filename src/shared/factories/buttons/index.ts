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
  /**
   * @description The id of the button
   */
  id: string;
  /**
   * @description The data of the button containing the style, disabled, emoji, and label
   */
  data: Omit<ButtonComponentData, "customId">;
  /**
   * @description The function to execute the button
   */
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
      const data = props.data;
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
