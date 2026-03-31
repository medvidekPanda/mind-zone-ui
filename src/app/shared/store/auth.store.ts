import { computed, inject } from "@angular/core";

import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { catchError, of, pipe, switchMap, tap } from "rxjs";

import { User, UserPayload } from "../interfaces/user.interface";
import { AuthService } from "../service/auth.service";
import { UserService } from "../service/user.service";

type AuthState = {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  needsRegistration: boolean;
};

const initialState: AuthState = {
  currentUser: null,
  isLoading: true, // guard waits for false — Firebase auth state is async
  error: null,
  isAuthenticated: false,
  needsRegistration: false,
};

export interface LoginPayload {
  email: string;
  password: string;
}

export const AuthStore = signalStore(
  { providedIn: "root" },
  withState(initialState),

  withComputed(({ currentUser }) => ({
    fullName: computed(() => {
      const user = currentUser();
      return user ? `${user.firstName} ${user.lastName}` : null;
    }),
  })),

  withMethods((store, authService = inject(AuthService), userService = inject(UserService)) => ({
    login: rxMethod<LoginPayload>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ email, password }) =>
          authService.login(email, password).pipe(
            tap(() => patchState(store, { isAuthenticated: true, isLoading: false, error: null })),
            switchMap(() =>
              userService.getMe().pipe(
                tap((user) => patchState(store, { currentUser: user, needsRegistration: false })),
                catchError(() => {
                  patchState(store, { needsRegistration: true });
                  return of(null);
                }),
              ),
            ),
            catchError((err) => {
              patchState(store, {
                error: err.message,
                isLoading: false,
                isAuthenticated: false,
                currentUser: null,
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    logout: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          authService.logout().pipe(
            tap(() =>
              patchState(store, {
                currentUser: null,
                isAuthenticated: false,
                isLoading: false,
                needsRegistration: false,
                error: null,
              }),
            ),
            catchError((err) => {
              patchState(store, { error: err.message, isLoading: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    loadCurrentUser: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          authService.currentUser$.pipe(
            switchMap((firebaseUser) => {
              if (!firebaseUser) {
                patchState(store, {
                  currentUser: null,
                  isAuthenticated: false,
                  isLoading: false,
                  needsRegistration: false,
                });
                return of(null);
              }
              patchState(store, { isAuthenticated: true, isLoading: false });
              return userService.getMe().pipe(
                tap((user) => patchState(store, { currentUser: user, needsRegistration: false })),
                catchError(() => {
                  patchState(store, { needsRegistration: true });
                  return of(null);
                }),
              );
            }),
          ),
        ),
      ),
    ),

    completeRegistration: rxMethod<UserPayload>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((payload) =>
          userService.createUser(payload).pipe(
            tap((user) =>
              patchState(store, {
                currentUser: user,
                needsRegistration: false,
                isLoading: false,
              }),
            ),
            catchError((err) => {
              patchState(store, { error: err.message, isLoading: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    syncCurrentUser: (user: User) => patchState(store, { currentUser: user }),
    clearError: () => patchState(store, { error: null }),
  })),
);
