import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'users/:id', renderMode: RenderMode.Server },
  { path: 'users/:id/clients', renderMode: RenderMode.Server },
  { path: 'clients/:id', renderMode: RenderMode.Server },
  { path: 'clients/:id/edit', renderMode: RenderMode.Server },
  { path: 'sessions/:id', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Prerender },
];
