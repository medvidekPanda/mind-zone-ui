import { computed, inject } from "@angular/core";

import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { catchError, of, pipe, switchMap, tap } from "rxjs";

import { Client, ClientPayload, ClientStatus } from "../interfaces/client.interface";
import { ClientService } from "../service/client.service";

type ClientState = {
  clients: Client[];
  client: Client | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: ClientState = {
  clients: [],
  client: null,
  isLoading: false,
  error: null,
};

export const ClientStore = signalStore(
  { providedIn: "root" },
  withState(initialState),

  withMethods((store, clientService = inject(ClientService)) => ({
    loadClient: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((id) =>
          clientService.getClient(id).pipe(
            tap((client) => patchState(store, { client, isLoading: false })),
            catchError((error) => {
              patchState(store, { error: error.message, isLoading: false, client: null });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          clientService.getClients().pipe(
            tap((clients) => patchState(store, { clients, isLoading: false, error: null })),
            catchError((error) => {
              patchState(store, { error: error.message, isLoading: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    createClient: rxMethod<ClientPayload>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((payload) =>
          clientService.createClient(payload).pipe(
            tap((newClient) => {
              patchState(store, {
                clients: [...store.clients(), newClient],
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

    deleteClient: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { error: null })),
        switchMap((id) => {
          const originalClients = store.clients();
          patchState(store, {
            clients: store.clients().filter((client) => client.id !== id),
          });

          return clientService.deleteClient(id).pipe(
            catchError((error) => {
              patchState(store, {
                clients: originalClients,
                error: "Failed to delete client.",
              });
              return of(null);
            }),
          );
        }),
      ),
    ),

    updateClient: rxMethod<{ id: string; payload: Partial<ClientPayload> }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, payload }) =>
          clientService.updateClient(id, payload as ClientPayload).pipe(
            tap((client) => {
              patchState(store, { client, isLoading: false, error: null });
            }),
            catchError((error) => {
              patchState(store, { error: error.message, isLoading: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    resetClient: () => patchState(store, { client: null }),
    resetAll: () => patchState(store, initialState),
  })),
);
