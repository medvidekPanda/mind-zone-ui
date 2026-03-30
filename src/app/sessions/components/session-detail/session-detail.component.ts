import { Location } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";

import { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";
import { SkeletonModule } from "primeng/skeleton";

import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { SessionStore } from "../../../shared/store/session.store";
import { SessionFormComponent } from "../session-form/session-form.component";

@Component({
  selector: "app-session-detail",
  imports: [ButtonModule, MenuModule, SkeletonModule, PageHeaderComponent, RouterLink, SessionFormComponent],
  templateUrl: "./session-detail.component.html",
  host: { class: "flex flex-col overflow-hidden h-full" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionDetailComponent {
  private readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly sessionStore = inject(SessionStore);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  private readonly id = computed(() => this.paramMap()?.get("id"));

  protected readonly actionMenuItems = computed<MenuItem[]>(() => [
    {
      label: this.paid() ? "Označit jako nezaplaceno" : "Označit jako zaplaceno",
      icon: this.paid() ? "pi pi-times-circle" : "pi pi-check-circle",
      command: () => this.paid.update((v) => !v),
    },
    { separator: true },
    { label: "Generovat fakturu", icon: "pi pi-file-pdf", command: () => this.onGenerateInvoice() },
    { label: "Odeslat shrnutí e-mailem", icon: "pi pi-envelope", command: () => this.onSendSummary() },
    { separator: true },
    { label: "Smazat záznam", icon: "pi pi-trash", command: () => this.onDelete() },
  ]);

  protected readonly clientIdFromUrl = computed(() => this.queryParamMap()?.get("clientId") ?? null);
  protected readonly isLoading = this.sessionStore.isLoading;
  protected readonly isNewSession = computed(() => !this.sessionStore.session()?.id);

  protected readonly pageTitle = computed(() => {
    const session = this.session();
    if (this.isNewSession()) return "Nové sezení";
    if (this.sessionStore.isEditing()) return "Úprava sezení";
    if (!session?.date) return "Záznam sezení";

    const date = new Date(session.date);
    const formattedDate = date.toLocaleDateString("cs-CZ");
    const formattedTime = date.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
    return `Záznam sezení: ${formattedDate} ${formattedTime}`;
  });

  protected readonly paid = signal(false);
  protected readonly session = computed(() => this.sessionStore.session());

  constructor() {
    this.sessionStore.resetSession();

    const id = this.id();
    if (id) {
      this.sessionStore.loadSession(id);
    }

    this.syncPaidWithSession();

    effect(() => {
      const isNewSession = this.isNewSession();
      const session = this.sessionStore.session();

      if (!isNewSession && session?.id) {
        this.location.replaceState(`/sessions/${session.id}`);
      }
    });
  }

  protected onCancelled(): void {
    if (this.isNewSession()) {
      this.router.navigate(["/sessions"]);
    } else {
      this.sessionStore.stopEditing();
    }
  }

  protected onGenerateInvoice(): void {
    // TODO: implement after API integration
  }

  protected onSendSummary(): void {
    // TODO: implement after API integration
  }

  protected onDelete(): void {
    // TODO: implement after API integration
  }

  private syncPaidWithSession(): void {
    effect(() => {
      const session = this.session();
      if (session?.id) this.paid.set(session.paid ?? false);
    });
  }
}
