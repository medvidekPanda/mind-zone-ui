import { computed, inject } from "@angular/core";

import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { catchError, mergeMap, of, pipe, switchMap, tap } from "rxjs";

import { Session, SessionAttachment, SessionPayload } from "../interfaces/session.interface";
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
    loadAll: rxMethod<{ from?: string; to?: string; userId?: string } | void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((params) =>
          sessionService.getSessions(params || undefined).pipe(
            tap((sessions) => patchState(store, { sessions, isLoading: false, error: null })),
            catchError((error) => {
              patchState(store, { error: error.message, isLoading: false });
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
            catchError((error) => {
              patchState(store, { error: error.message, isLoading: false, session: null });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    createSession: rxMethod<SessionPayload>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((payload) =>
          sessionService.createSession(payload).pipe(
            tap((session) => patchState(store, { session, isLoading: false, error: null })),
            catchError((error) => {
              patchState(store, { error: error.message, isLoading: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    updateSession: rxMethod<{ id: string; payload: Partial<SessionPayload> }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, payload }) =>
          sessionService.updateSession(id, payload).pipe(
            tap((session) => patchState(store, { session, isLoading: false, error: null })),
            catchError((error) => {
              patchState(store, { error: error.message, isLoading: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    deleteSession: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) =>
          sessionService.deleteSession(id).pipe(
            tap(() => {
              patchState(store, {
                sessions: store.sessions().filter((session) => session.id !== id),
                isLoading: false,
                error: null,
              });
            }),
            catchError((error) => {
              patchState(store, { error: error.message, isLoading: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    uploadAttachment: rxMethod<{ sessionId: string; file: File }>(
      pipe(
        mergeMap(({ sessionId, file }) =>
          sessionService.uploadAttachment(sessionId, file).pipe(
            tap((attachment: SessionAttachment) => {
              const session = store.session();
              if (session) {
                patchState(store, { session: { ...session, attachments: [...session.attachments, attachment] } });
              }
            }),
            catchError((error) => {
              patchState(store, { error: error.message });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    deleteAttachment: rxMethod<{ sessionId: string; attachmentId: string }>(
      pipe(
        switchMap(({ sessionId, attachmentId }) =>
          sessionService.deleteAttachment(sessionId, attachmentId).pipe(
            tap(() => {
              const session = store.session();
              if (session) {
                patchState(store, {
                  session: { ...session, attachments: session.attachments.filter((a) => a.id !== attachmentId) },
                });
              }
            }),
            catchError((error) => {
              patchState(store, { error: error.message });
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
