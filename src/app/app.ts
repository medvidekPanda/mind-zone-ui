import { ChangeDetectionStrategy, Component, computed, effect, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Router, RouterLink, RouterOutlet } from "@angular/router";

import type { MenuItem } from "primeng/api";
import { BadgeModule } from "primeng/badge";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";
import { MenubarModule } from "primeng/menubar";

import { AuthService } from "./shared/service/auth.service";
import { AuthStore } from "./shared/store/auth.store";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, RouterLink, MenubarModule, ButtonModule, BadgeModule, MenuModule],
  templateUrl: "./app.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    this.authStore.loadCurrentUser();
    effect(() => {
      if (this.authStore.needsRegistration()) {
        this.router.navigate(["/setup"]);
      } else if (!this.authStore.isLoading() && !this.authStore.isAuthenticated()) {
        this.router.navigate(["/login"]);
      }
    });
  }

  private readonly firebaseUser = toSignal(this.authService.currentUser$);

  protected readonly displayName = computed(() => {
    const storeUser = this.authStore.currentUser();
    if (storeUser) return `${storeUser.firstName} ${storeUser.lastName}`;
    return this.firebaseUser()?.email ?? "";
  });

  protected readonly displayInitials = computed(() => {
    const storeUser = this.authStore.currentUser();
    if (storeUser) {
      return `${storeUser.firstName[0]}${storeUser.lastName[0]}`.toUpperCase();
    }
    const email = this.firebaseUser()?.email ?? "";
    return email.slice(0, 2).toUpperCase();
  });

  protected readonly userMenuItems: MenuItem[] = [
    {
      label: "Odhlásit se",
      icon: "pi pi-sign-out",
      command: () => this.authStore.logout(),
    },
  ];

  protected readonly menuItems: MenuItem[] = [
    { label: "Dashboard", icon: "pi pi-th-large", routerLink: "/dashboard", routerLinkActiveOptions: { exact: true } },
    { label: "Terapeuti", icon: "pi pi-users", routerLink: "/users" },
    { label: "Klienti", icon: "pi pi-id-card", routerLink: "/clients" },
    {
      label: "Sezení",
      icon: "pi pi-calendar",
      items: [
        { label: "Seznam sezení", icon: "pi pi-list", routerLink: "/sessions" },
        { label: "Kalendář", icon: "pi pi-calendar-plus", routerLink: "/sessions/calendar" },
      ],
    },
  ];
}
