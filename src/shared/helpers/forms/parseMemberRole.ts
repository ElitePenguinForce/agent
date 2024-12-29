import type { ReadableStaffRole } from "../../types/index.js";

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
