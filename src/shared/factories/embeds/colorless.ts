import { type APIEmbed, EmbedBuilder } from "discord.js";

export default function createColorlessEmbed(data: APIEmbed) {
  return new EmbedBuilder(data);
}
