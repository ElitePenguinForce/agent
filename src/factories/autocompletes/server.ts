import Guild from "../../db/models/guild.js";
import isGuard from "../../utils/isGuard.js";
import createAutocomplete from "../autocomplete.js";

export function createServerAutocomplete() {
  return createAutocomplete({
    execute: async (interaction) => {
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
    },
  });
}
