import config from "../../config";

export default function isGuard(roleIds: string[]) {
  return roleIds.includes(config.ids.roles.guard);
}
