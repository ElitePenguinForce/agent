import type { AutocompleteInteraction } from "discord.js";
import Guild from "../../core/db/models/guild.js";
import isGuard from "./isGuard.js";

export default async function handleServerAutocomplete(
  interaction: AutocompleteInteraction,
) {
  if (!interaction.member) {
    return;
  }

  const value = interaction.options.getString("server", true);
  const name = {
    $regex: new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
  };

  const query = isGuard(interaction.member)
    ? { name }
    : {
        representative: interaction.user.id,
        name,
      };

  const representing = await Guild.find(query).sort({ name: 1 }).limit(25);

  return interaction.respond(
    representing.map((doc) => ({
      name: doc.name,
      value: doc._id as string,
    })),
  );
}
