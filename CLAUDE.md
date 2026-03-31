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

## App Areas

Routes (all behind `authGuard` except `login` / `setup`):

- `dashboard`
- `users` / `users/:id` / `users/:id/clients`
- `clients` / `clients/:id`
- `sessions` / `sessions/:id` / `sessions/calendar`

## Key Source Paths

```
src/app/
  auth/            # Login, setup
  clients/         # Clients list + detail
  dashboard/
  sessions/        # Sessions list, detail, calendar, form
  users/           # Users list, detail
  shared/
    components/    # Shared UI components
    constants/     # Enum options
    interfaces/    # Shared TypeScript interfaces
    service/       # Auth guard, services
    store/         # Global AppStore (enum options/labels)
    utils/
```

## Signal Stores

`signalStore` from `@ngrx/signals`. Global `AppStore` (provided in root) holds enum metadata. Feature stores live alongside their feature.

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
