import { inject } from "@angular/core";

import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { catchError, of, pipe, switchMap, tap } from "rxjs";

import { User, UserPayload } from "../interfaces/user.interface";
import { UserService } from "../service/user.service";
import { AuthStore } from "./auth.store";

type UserState = {
  users: User[];
  user: User | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: UserState = {
  users: [],
  user: null,
  isLoading: false,
  error: null,
};

export const UserStore = signalStore(
  { providedIn: "root" },
  withState(initialState),

  withMethods((store, userService = inject(UserService), authStore = inject(AuthStore)) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          userService.getUsers().pipe(
            tap((users) => patchState(store, { users, isLoading: false, error: null })),
            catchError((err) => {
              patchState(store, { error: err.message, isLoading: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),

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
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((payload) =>
          userService.createUser(payload).pipe(
            tap((user) => {
              patchState(store, { user, isLoading: false, error: null });
            }),
            catchError((err) => {
              patchState(store, { error: err.message, isLoading: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    updateUser: rxMethod<{ id: string; payload: Partial<UserPayload> }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, payload }) =>
          userService.updateUser(id, payload).pipe(
            tap((user) => {
              patchState(store, { user, isLoading: false, error: null });
              if (authStore.currentUser()?.id === user.id) {
                authStore.syncCurrentUser(user);
              }
            }),
            catchError((err) => {
              patchState(store, { error: err.message, isLoading: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    deleteUser: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { error: null })),
        switchMap((id) => {
          const originalUsers = store.users();
          patchState(store, { users: originalUsers.filter((u) => u.id !== id) });

          return userService.deleteUser(id).pipe(
            catchError((err) => {
              patchState(store, { users: originalUsers, error: err.message });
              return of(null);
            }),
          );
        }),
      ),
    ),

    resetUser: () => patchState(store, { user: null }),
    resetAll: () => patchState(store, initialState),
  })),
);
