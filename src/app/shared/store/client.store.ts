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
  filter: { query: string; status: ClientStatus | null };
};

const initialState: ClientState = {
  clients: [],
  client: null,
  isLoading: false,
  error: null,
  filter: { query: "", status: null },
};

export const ClientStore = signalStore(
  { providedIn: "root" },
  withState(initialState),

  withComputed(({ clients, filter }) => ({
    filteredClients: computed(() => {
      const query = filter.query().toLowerCase();

      return clients().filter(
        ({ firstName, lastName, status }) =>
          (firstName.toLowerCase().includes(query) || lastName.toLowerCase().includes(query)) &&
          (!status || status === status),
      );
    }),
    totalCount: computed(() => clients().length),
  })),

  withMethods((store, clientService = inject(ClientService)) => ({
    loadClient: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((id) =>
          clientService.getClient(id).pipe(
            tap((client) => patchState(store, { client, isLoading: false })),
            catchError((err) => {
              patchState(store, { error: err.message, isLoading: false, client: null });
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
            catchError((err) => {
              patchState(store, { error: err.message, isLoading: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    createClient: rxMethod<{ payload: ClientPayload; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ payload, onSuccess }) =>
          clientService.createClient(payload).pipe(
            tap((newClient) => {
              patchState(store, {
                clients: [...store.clients(), newClient],
                isLoading: false,
                error: null,
              });
              onSuccess?.();
            }),
            catchError((err) => {
              patchState(store, { error: err.message, isLoading: false });
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
            clients: store.clients().filter((c) => c.id !== id),
          });

          return clientService.deleteClient(id).pipe(
            catchError((err) => {
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

    updateClient: rxMethod<{ id: string; payload: ClientPayload; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, payload, onSuccess }) =>
          clientService.updateClient(id, payload).pipe(
            tap((client) => {
              patchState(store, { client, isLoading: false, error: null });
              onSuccess?.();
            }),
            catchError((err) => {
              patchState(store, { error: err.message, isLoading: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    resetClient: () => patchState(store, { client: null }),
    resetAll: () => patchState(store, initialState),
    updateFilter: (filter: Partial<ClientState["filter"]>) =>
      patchState(store, (state) => ({
        filter: { ...state.filter, ...filter },
      })),
  })),
);
