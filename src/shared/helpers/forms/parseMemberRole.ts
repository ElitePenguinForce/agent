import type { ReadableStaffRole } from "../../types/index.js";

/**
 * Parses the member role
 *
 * @param role The role to parse
 * @returns {ReadableStaffRole | null} The parsed role or null if the role is not valid
 */
export default function parseMemberRole(
  role: string,
): ReadableStaffRole | null {
  switch (role.toLowerCase()) {
    case "mod":
      return "Moderador";
    case "adm":
    case "admin":
      return "Administrador";
    case "dono":
    case "dona":
    case "owner":
      return "Dono";
    default:
      return null;
  }
}
