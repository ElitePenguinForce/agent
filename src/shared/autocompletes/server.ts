import { AutocompleteInteraction } from "seyfert";
import config from "../../config";
import guildModel from "../../database/models/guild.model";

export default async function serverAutocomplete(
  interaction: AutocompleteInteraction,
) {
  const value = interaction.getInput();
  const name = {
    $regex: new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
  };
  const memberRoles = await interaction.member?.roles.list() ?? [];
  const query = memberRoles.some((role) => role.id === config.ids.roles.guard)
    ? { name }
    : {
      representative: interaction.user.id,
      name,
    };

  const guilds = await guildModel.find(query).sort({ name: 1 }).limit(25);

  return interaction.respond(
    guilds.map((doc) => ({
      name: doc.name,
      value: doc._id as string,
    })),
  );
}
