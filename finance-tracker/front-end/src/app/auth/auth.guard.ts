import { inject } from "@angular/core";
import { AuthService } from "./auth.service"
import { CanActivateFn, Router, UrlTree } from "@angular/router";

export const canActivateAuth: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated()) {
    return true;
  }
  return inject(Router).createUrlTree(['/login']);
};
