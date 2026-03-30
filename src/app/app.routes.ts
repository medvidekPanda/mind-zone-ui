import { Routes } from "@angular/router";

import { authGuard } from "./shared/service/auth.guard";

export const routes: Routes = [
  {
    path: "login",
    loadComponent: () => import("./auth/login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "setup",
    loadComponent: () => import("./auth/setup/setup.component").then((m) => m.SetupComponent),
  },
  {
    path: "",
    canActivate: [authGuard],
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      {
        path: "dashboard",
        loadComponent: () => import("./dashboard/dashboard.component").then((m) => m.DashboardComponent),
      },
      {
        path: "users",
        loadComponent: () => import("./users/users-list.component").then((m) => m.UsersListComponent),
      },
      {
        path: "users/new",
        data: { isNew: true },
        loadComponent: () =>
          import("./users/components/user-detail/user-detail.component").then((m) => m.UserDetailComponent),
      },
      {
        path: "users/:id",
        data: { isNew: false },
        loadComponent: () =>
          import("./users/components/user-detail/user-detail.component").then((m) => m.UserDetailComponent),
      },
      {
        path: "users/:id/clients",
        loadComponent: () =>
          import("./users/components/user-clients/user-clients.component").then((m) => m.UserClientsComponent),
      },
      {
        path: "clients",
        loadComponent: () => import("./clients/clients-list.component").then((m) => m.ClientsListComponent),
      },
      {
        path: "clients/new",
        data: { isNew: true },
        loadComponent: () =>
          import("./clients/components/client-detail/client-detail.component").then((m) => m.ClientDetailComponent),
      },
      {
        path: "clients/:id",
        data: { isNew: false },
        loadComponent: () =>
          import("./clients/components/client-detail/client-detail.component").then((m) => m.ClientDetailComponent),
      },
      {
        path: "sessions",
        loadComponent: () => import("./sessions/sessions-list.component").then((m) => m.SessionsListComponent),
      },
      {
        path: "sessions/new",
        loadComponent: () =>
          import("./sessions/components/session-detail/session-detail.component").then((m) => m.SessionDetailComponent),
      },
      {
        path: "sessions/calendar",
        loadComponent: () =>
          import("./sessions/components/sessions-calendar/sessions-calendar.component").then(
            (m) => m.SessionsCalendarComponent,
          ),
      },
      {
        path: "sessions/:id",
        loadComponent: () =>
          import("./sessions/components/session-detail/session-detail.component").then((m) => m.SessionDetailComponent),
      },
    ],
  },
  { path: "**", redirectTo: "/" },
];
