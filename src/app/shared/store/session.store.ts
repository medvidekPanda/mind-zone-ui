import { computed, inject } from "@angular/core";

import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { catchError, of, pipe, switchMap, tap } from "rxjs";

import { Session, SessionPayload } from "../interfaces/session.interface";
import { SessionService } from "../service/session.service";

type SessionState = {
  sessions: Session[];
  session: Session | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: SessionState = {
  sessions: [],
  session: null,
  isLoading: false,
  error: null,
};

export const SessionStore = signalStore(
  { providedIn: "root" },
  withState(initialState),

  withMethods((store, sessionService = inject(SessionService)) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          sessionService.getSessions().pipe(
            tap((sessions) => patchState(store, { sessions, isLoading: false, error: null })),
            catchError((err) => {
              patchState(store, { error: err.message, isLoading: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    loadSession: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((id) =>
          sessionService.getSession(id).pipe(
            tap((session) => patchState(store, { session, isLoading: false, error: null })),
            catchError((err) => {
              patchState(store, { error: err.message, isLoading: false, session: null });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    createSession: rxMethod<SessionPayload>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((payload) =>
          sessionService.createSession(payload).pipe(
            tap((session) => patchState(store, { session, isLoading: false, error: null })),
            catchError((err) => {
              patchState(store, { error: err.message, isLoading: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    updateSession: rxMethod<{ id: string; payload: SessionPayload }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ id, payload }) =>
          sessionService.updateSession(id, payload).pipe(
            tap((session) => patchState(store, { session, isLoading: false, error: null })),
            catchError((err) => {
              patchState(store, { error: err.message, isLoading: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    resetSession: () => patchState(store, { session: null }),
    resetAll: () => patchState(store, initialState),
  })),
);
