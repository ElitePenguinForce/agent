import type { Autocomplete } from "../../types/autocomplete.js";

type Options = Autocomplete<"cached">;

export default function createAutocomplete(
  autocomplete: Options,
): Autocomplete<"cached"> {
  return autocomplete;
}
