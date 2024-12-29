import { createMiddleware } from "seyfert";
import isGuard from "../shared/utils/isGuard";

export const guardOnly = createMiddleware<void>(({ stop, next, context }) => {
  if (!isGuard(context.member?.roles.keys || [])) {
    return stop("Você não tem permissão para usar este comando");
  }

  return next();
});
