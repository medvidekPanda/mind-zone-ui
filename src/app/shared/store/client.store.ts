import { inject } from "@angular/core";

import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { catchError, of, pipe, switchMap, tap } from "rxjs";

import { Client, ClientPayload } from "../interfaces/client.interface";
import { ClientService } from "../service/client.service";

type ClientState = {
  clients: Client[];
  client: Client | null;
  isEditing: boolean;
  isLoadingClient: boolean;
  isLoadingList: boolean;
  error: string | null;
};

const initialState: ClientState = {
  clients: [],
  client: null,
  isEditing: false,
  isLoadingClient: false,
  isLoadingList: false,
  error: null,
};

export const ClientStore = signalStore(
  { providedIn: "root" },
  withState(initialState),

  withMethods((store, clientService = inject(ClientService)) => ({
    loadClient: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoadingClient: true })),
        switchMap((id) =>
          clientService.getClient(id).pipe(
            tap((client) => patchState(store, { client, isLoadingClient: false })),
            catchError((error) => {
              patchState(store, { error: error.message, isLoadingClient: false, client: null });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoadingList: true })),
        switchMap(() =>
          clientService.getClients().pipe(
            tap((clients) => patchState(store, { clients, isLoadingList: false, error: null })),
            catchError((error) => {
              patchState(store, { error: error.message, isLoadingList: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    createClient: rxMethod<ClientPayload>(
      pipe(
        tap(() => patchState(store, { isLoadingClient: true, error: null })),
        switchMap((payload) =>
          clientService.createClient(payload).pipe(
            tap((newClient) => {
              patchState(store, {
                client: newClient,
                clients: [...store.clients(), newClient],
                isEditing: false,
                isLoadingClient: false,
                error: null,
              });
            }),
            catchError((error) => {
              patchState(store, { error: error.message, isLoadingClient: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    updateClient: rxMethod<{ id: string; payload: Partial<ClientPayload> }>(
      pipe(
        tap(() => patchState(store, { isLoadingClient: true, error: null })),
        switchMap(({ id, payload }) =>
          clientService.updateClient(id, payload as ClientPayload).pipe(
            tap((client) => {
              patchState(store, { client, isEditing: false, isLoadingClient: false, error: null });
            }),
            catchError((error) => {
              patchState(store, { error: error.message, isLoadingClient: false });
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
          patchState(store, { clients: store.clients().filter((client) => client.id !== id) });

          return clientService.deleteClient(id).pipe(
            catchError(() => {
              patchState(store, { clients: originalClients, error: "Failed to delete client." });
              return of(null);
            }),
          );
        }),
      ),
    ),

    startEditing: () => patchState(store, { isEditing: true }),
    stopEditing: () => patchState(store, { isEditing: false }),
    resetClient: () => patchState(store, { client: null, isEditing: false }),
    resetAll: () => patchState(store, initialState),
  })),
);
