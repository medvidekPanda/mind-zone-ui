import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";

import { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";

import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { SessionStore } from "../../../shared/store/session.store";
import { SessionFormComponent } from "../session-form/session-form.component";

@Component({
  selector: "app-session-detail",
  imports: [ButtonModule, MenuModule, PageHeaderComponent, RouterLink, SessionFormComponent],
  templateUrl: "./session-detail.component.html",
  host: { class: "flex flex-col overflow-hidden h-full" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionDetailComponent {
  private readonly sessionStore = inject(SessionStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  private readonly id = computed(() => this.paramMap()?.get("id") ?? undefined);

  protected readonly isNewSession: boolean = this.route.snapshot.data["isNew"];
  protected readonly clientIdFromUrl = computed(() => this.queryParamMap()?.get("clientId") ?? null);
  protected readonly session = computed(() => this.sessionStore.session());
  protected readonly editing = signal(this.isNewSession);
  protected readonly paid = signal(false);

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

  protected readonly pageTitle = computed(() => {
    const s = this.session();
    if (this.isNewSession) return "Nové sezení";
    if (this.editing()) return "Úprava sezení";
    if (!s?.date) return "Záznam sezení";

    const d = new Date(s.date);
    const formattedDate = d.toLocaleDateString("cs-CZ");
    const formattedTime = d.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
    return `Záznam sezení: ${formattedDate} ${formattedTime}`;
  });

  constructor() {
    if (this.isNewSession) {
      this.sessionStore.resetSession();
    } else {
      const id = this.id();
      if (id) {
        this.sessionStore.loadSession(id);
      }

      this.syncPaidWithSession();
    }
  }

  protected startEdit(): void {
    this.editing.set(true);
  }

  protected onSaved(): void {
    if (this.isNewSession) {
      this.router.navigate(["/sessions"]);
    } else {
      this.editing.set(false);
    }
  }

  protected onCancelled(): void {
    if (this.isNewSession) {
      this.router.navigate(["/sessions"]);
    } else {
      this.editing.set(false);
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
      const s = this.session();
      if (s?.id) this.paid.set(s.paid ?? false);
    });
  }
}
