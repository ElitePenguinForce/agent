import Guild from "../../../core/db/models/guild.js";
import type { Autocomplete } from "../../types/autocomplete.js";
import isGuard from "../../../shared/helpers/isGuard.js";
import createAutocomplete from "./index.js";

type Options = Omit<Autocomplete<"cached">, "execute">;

export function createServerAutocomplete(
  options: Options,
): Autocomplete<"cached"> {
  return createAutocomplete({
    ...options,
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
