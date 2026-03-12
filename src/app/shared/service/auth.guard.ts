import { inject } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { CanActivateFn, Router } from "@angular/router";

import { filter, map, take } from "rxjs";

import { AuthStore } from "../store/auth.store";

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return toObservable(authStore.isLoading).pipe(
    filter((loading) => !loading),
    take(1),
    map(() => {
      if (!authStore.isAuthenticated()) return router.createUrlTree(["/login"]);
      if (authStore.needsRegistration()) return router.createUrlTree(["/setup"]);
      return true;
    }),
  );
};
