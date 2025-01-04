import { type APIEmbed, EmbedBuilder } from "discord.js";

export default function createColorlessEmbed(data: Omit<APIEmbed, "color">) {
  return new EmbedBuilder({ ...data, color: 0x2b2d31 });
}
