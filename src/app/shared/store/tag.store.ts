import { inject } from "@angular/core";

import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { catchError, of, pipe, switchMap, tap } from "rxjs";

import { Tag } from "../interfaces/tag.interface";
import { TagService } from "../service/tag.service";

type TagState = {
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
};

const initialState: TagState = {
  tags: [],
  isLoading: false,
  error: null,
};

export const TagStore = signalStore(
  { providedIn: "root" },
  withState(initialState),

  withMethods((store, tagService = inject(TagService)) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          tagService.getTags().pipe(
            tap((tags) => patchState(store, { tags, isLoading: false, error: null })),
            catchError((err) => {
              patchState(store, { error: err.message, isLoading: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),
  })),
);
