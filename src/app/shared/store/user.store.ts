import { inject } from "@angular/core";

import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { catchError, of, pipe, switchMap, tap } from "rxjs";

import { User, UserPayload } from "../interfaces/user.interface";
import { UserService } from "../service/user.service";

type UserState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
};

export const UserStore = signalStore(
  { providedIn: "root" },
  withState(initialState),

  withMethods((store, userService = inject(UserService)) => ({
    loadUser: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((id) =>
          userService.getUser(id).pipe(
            tap((user) => patchState(store, { user, isLoading: false, error: null })),
            catchError((err) => {
              patchState(store, { error: err.message, isLoading: false, user: null });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    createUser: rxMethod<UserPayload>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((payload) =>
          userService.createUser(payload).pipe(
            tap((user) => patchState(store, { user, isLoading: false, error: null })),
            catchError((err) => {
              patchState(store, { error: err.message, isLoading: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    updateUser: rxMethod<{ id: string; payload: UserPayload }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ id, payload }) =>
          userService.updateUser(id, payload).pipe(
            tap((user) => patchState(store, { user, isLoading: false, error: null })),
            catchError((err) => {
              patchState(store, { error: err.message, isLoading: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    resetUser: () => patchState(store, { user: null }),
  })),
);
