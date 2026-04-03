# Mind Zone UI - Claude Code Instructions

## Project Structure

Single Angular 21 app at the repo root.

- `src/` — Angular app source
- `proxy/` — Node.js Express proxy, planned nginx migration
- `nginx/` — nginx config (see [NGINX-MIGRATION.md](NGINX-MIGRATION.md))

## Build & Run

```bash
npm start          # Dev server on :4200
npm test           # Vitest unit/integration tests
npm run build      # Production build
npm run build:dev  # Dev build
npm run proxy      # Run Express proxy standalone
npm run start:dev  # Build dev + start proxy
```

## Architecture

- **State management:** NgRx Signals (`@ngrx/signals`) — signal stores
- **Change detection:** Zoneless
- **Components:** Standalone, OnPush
- **UI:** PrimeNG 21 + Tailwind CSS 4
- **Auth:** Firebase Authentication (`@angular/fire`)
- **SSR:** Angular SSR with Express

## Angular Conventions

Use the **Angular CLI MCP** (`get_best_practices`, `search_documentation`, `find_examples`) before writing or changing Angular code. Follow its guidance with one exception:

- **Naming:** keep pre-v20 suffixes — `LoginComponent`, `AuthGuard`, `SessionStore` — not the suffix-free style introduced in v20+
- **Templates:** never call injected services or signal stores directly from the template (e.g. `(click)="myService.doThing()"`, `sessionStore.startEditing()`). Use `protected` component methods, `computed()` values, or readonly field aliases to store signals instead

### Component host vs. template wrapper

Avoid an extra root `div` whose only job is layout or chrome on the component itself:

- **No inner wrapper needed:** put those Tailwind (or other) classes on the component **`host`** via `@Component({ host: { class: '...' } })` and let the template start with the real structure (possibly multiple root nodes). Merge with any existing `host` classes.
- **Inner wrapper required:** when the template must keep a real box (e.g. `position: relative`, drop targets, scroll container, or a single element that carries structural directives), set the host to **`contents`** using Tailwind (`host: { class: 'contents' }`) so the host does not participate in layout and the wrapper `div` (or other element) holds the styling and behavior.
- **Prefer `contents` for thin wrappers:** leaf UI controls (`app-form-*` around one PrimeNG widget), single-action components (e.g. reload button), profile cards with one `p-card` root, and forms whose root is already a `<form>` with layout classes — use `host: { class: 'contents' }` (and merge with other host utility classes like `space-y-6` when needed) so the host node stays in the DOM for Angular but is skipped in the **CSS box tree**. Do **not** use `contents` on a host that must itself be the flex/grid container (e.g. page shell headers with `justify-between` on the host).

## App Areas

Routes (all behind `authGuard` except `login` / `setup`):

- `dashboard`
- `users` / `users/:id` / `users/:id/clients`
- `clients` / `clients/:id`
- `sessions` / `sessions/:id` (legacy URL `sessions/calendar` redirects to `calendar`)
- `calendar`

## Key Source Paths

```
src/app/
  auth/            # Login, setup
  calendar/        # Weekly calendar: page, components/, service/
  clients/         # Clients list + detail
  dashboard/
  sessions/        # Sessions list, detail, form
  users/           # Users list, detail
  shared/
    components/    # Shared UI components (includes page-header)
    constants/     # Domain options (session, client, calendar, …)
    interfaces/    # Shared TypeScript interfaces (incl. calendar.interface)
    service/       # Auth guard, services
    store/         # AppStore, entity stores, calendar-page store (see Signal Stores)
    utils/         # Shared helpers (date.utils, calendar.utils, …)
```

## Feature folder layout

Keep each **feature area** (`users`, `sessions`, `calendar`, …) consistent:

- **Feature root** (`src/app/<feature>/`): route entry components only (`*-page`, list, detail) where practical — keep the root thin.
- **Feature-local wiring:** `src/app/<feature>/service/` for injectables scoped to that feature (e.g. `calendar/service/calendar-add-dialog.service.ts` plus small `*.model.ts` next to the service when types exist only for that wiring).
- **Domain data like `sessions` / `clients`:** put **`shared/constants/<domain>.constants.ts`**, **`shared/interfaces/<domain>.interface.ts`**, and **`shared/utils/<domain>.utils.ts`** (calendar follows this: `calendar.constants`, `calendar.interface`, `calendar.utils`).
- **Feature subcomponents:** `src/app/<feature>/components/<kebab-name>/` — one folder per component. Avoid many loose `*.component.ts` files directly under `components/`.
- **Global / cross-feature:** `shared/components/`, `shared/store/` (`AppStore`, `SessionStore`, **`CalendarPageStore`**, …), `shared/service/`, etc. **Lifetime** is separate from folder: use `providedIn: 'root'` only for true app-wide singletons; otherwise list the store in a route/component `providers` array (e.g. `CalendarPageComponent` still provides `CalendarPageStore` even though the file lives in `shared/store/`).

## Page shell

- Use **`PageHeaderComponent`** (`shared/components/page-header`, selector `app-page-header`) for page title and right-side actions. Pass **`title`** (required). Use optional **`subtitle`** for secondary context (e.g. date range under the title), matching the typography of list pages (`text-sm text-slate-500` under the `h1`).
- Put action buttons in a child element with the **`actions`** attribute; content projects into the header’s action row (same pattern as session detail).

## Signal Stores

`signalStore` from `@ngrx/signals`. All store **files** live in `shared/store/` for one place to look. **Root singletons** use `{ providedIn: 'root' }` (e.g. `SessionStore`). **Route-scoped** stores omit root provision and are listed only on the owning component (e.g. `CalendarPageStore`).

### Calendar (`src/app/calendar`)

- **`CalendarPageStore`** (`shared/store/calendar-page.store.ts`) is **provided only on `CalendarPageComponent`** — not a root singleton. Mock blocks/clients, week anchor, and drag payload live here. **`CalendarAddDialogService`** subscribes to the shared **`SessionScheduleDialogComponent`** close result and calls **`addConsultationBlock()`** for mock UI until the API can create empty sessions.
- **Schedule dialog:** Reuse **`sessions/components/session-schedule-dialog`** via root **`SessionScheduleDialogService`**. Calendar passes **`initialStartMs`** through `openDialog('', startMs)` so date and times are pre-filled from the clicked slot. Client detail still uses `openDialog(clientId)`.
- **Subcomponents** under `calendar/components/<name>/`: **`inject(CalendarPageStore)`**; no store method calls from templates.
- **Shared calendar modules:** `shared/constants/calendar.constants.ts`, `shared/interfaces/calendar.interface.ts`, `shared/utils/calendar.utils.ts` (grid + date helpers).
- Global drag-over styling: `.calendar-day-drop.p-draggable-enter` in `styles.css`.
- **App shell:** `main` uses `flex flex-col min-h-0` so routed pages (e.g. calendar) can use `flex-1 min-h-0` and fill the viewport height below the menubar.

### Detail page pattern (sessions is the reference)

- Store owns `isEditing`, `startEditing()`, `stopEditing()` — no local editing signal in the component
- `isNew` is derived: `computed(() => !store.entity()?.id)` — no `data: { isNew }` in routes
- Constructor: always `resetEntity()`, then `loadEntity(id)` if id present, else `startEditing()`
- After create, URL updates via `location.replaceState()` effect — no navigation to list
- Form components derive `isEditing` and `showActions` from the store — no `readonly`/`showActions` inputs
- No `saved` output from form components — store state change drives everything
- `cancelled` output stays (navigation decision belongs to the detail component)

## Testing

- **Unit/Integration:** Vitest 4.x — `npm test`
- **Test files:** `*.spec.ts` colocated with source

## Coding Conventions

- Arrow function parameters: always descriptive names, never single-letter (`session` not `s`)
- **Class member order:**
  1. Private fields (`inject()` calls + other private properties)
  2. Inputs (`input()` / `@Input()`)
  3. Outputs (`output()` / `@Output()`)
  4. Constructor
  5. Public + protected members (properties, lifecycle hooks, methods)
  6. Private methods
  - Blank line between each section
  - Within each group: alphabetical, or logical by importance
  - Comments only where they explain architecture — not routine labeling
- No unnecessary comments, docstrings, or type annotations on unchanged code
- **Dockerfile, GitHub Actions, shell scripts:** comment-free — only mandatory directives (shebang etc.). Document flows in `CLAUDE.md`, not inline

## Language & Commits

- **Language:** all code, comments, commit messages, and documentation must be in English
- **Commits:** no conventional-commit prefixes or scopes (NOT `feat:`, `feat(sessions):`, `fix:`, `chore:` etc.)
- Short plain subject line (e.g., "Add upload and transcription dialogs")
- Optional body after blank line: bullets for what changed
- No `Signed-off-by` or similar trailers

## Docker

`build-and-push.sh` at repo root. See [NGINX-MIGRATION.md](NGINX-MIGRATION.md) for planned nginx architecture.

## Proxy

`proxy/proxy-server.mts` — Express proxy forwarding `/api/*` to backend. **Will be replaced by nginx.** Avoid adding features to the proxy.
