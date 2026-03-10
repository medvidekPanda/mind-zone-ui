import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";

import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { Session, SessionFormat, SessionPayload, SessionType } from "../../../shared/interfaces/session.interface";
import { SessionAttachmentsComponent } from "./components/session-attachments/session-attachments.component";
import { SessionPaymentCardComponent } from "./components/session-payment-card/session-payment-card.component";
import { SessionQuickActionsComponent } from "./components/session-quick-actions/session-quick-actions.component";
import { SessionFormComponent } from "../session-form/session-form.component";

const MOCK_SESSIONS: Session[] = [
  {
    id: "1",
    date: "2025-02-26",
    time: "09:00",
    format: SessionFormat.IN_PERSON,
    type: SessionType.INDIVIDUAL,
    duration: 60,
    notes:
      "Klient přišel unavený, hovořili jsme o pracovním stresu a jeho dopadech na rodinné vztahy. Otevřelo se téma otcovských vzorů.",
    nextPlan: "Prozkoumat vztah s otcem, zadat deník emocí na příští týden.",
    tags: ["stres", "vztahy", "rodina"],
    price: 800,
    paid: true,
    clientId: "c1",
    therapistId: "1",
    createdAt: "2025-02-26T09:00:00Z",
    updatedAt: "2025-02-26T09:00:00Z",
  },
  {
    id: "2",
    date: "2025-02-26",
    time: "14:00",
    format: SessionFormat.ONLINE,
    type: SessionType.INDIVIDUAL,
    duration: 45,
    notes: "Online sezení proběhlo bez technických problémů. Klientka sdílela obavy z nadcházející změny zaměstnání.",
    nextPlan: "Zpracovat plán přechodu, identifikovat zdroje podpory.",
    tags: ["úzkost", "změna"],
    price: 700,
    paid: false,
    clientId: "c2",
    therapistId: "1",
    createdAt: "2025-02-26T14:00:00Z",
    updatedAt: "2025-02-26T14:00:00Z",
  },
];

@Component({
  selector: "app-session-detail",
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    PageHeaderComponent,
    RouterLink,
    SessionAttachmentsComponent,
    SessionFormComponent,
    SessionPaymentCardComponent,
    SessionQuickActionsComponent,
  ],
  templateUrl: "./session-detail.component.html",
  host: { class: "flex flex-col" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  protected readonly id = computed(() => this.paramMap()?.get("id") ?? undefined);

  protected readonly session = computed(() => MOCK_SESSIONS.find((s) => s.id === this.id()) ?? ({} as Session));
  protected readonly editing = signal(false);
  protected readonly isNewSession = computed(() => !this.id());
  protected readonly paid = signal<boolean>(false);

  protected readonly pageTitle = computed(() => {
    if (this.isNewSession()) return "Nové sezení";
    return this.editing() ? "Úprava sezení" : `Záznam sezení: ${this.session().date} ${this.session().time}`;
  });

  protected readonly cardHeader = computed(() => (this.editing() ? "Úprava záznamu" : "Záznam sezení"));

  constructor() {
    effect(() => {
      const s = this.session();
      if (s?.id) {
        this.paid.set(s.paid ?? false);
      }
    });
  }

  protected startEdit(): void {
    this.editing.set(true);
  }

  protected cancelEdit(): void {
    this.editing.set(false);
  }

  protected cancel(): void {
    if (this.id()) {
      this.cancelEdit();
    } else {
      this.router.navigate(["/sessions"]);
    }
  }

  protected onSave(): void {
    const { id } = this.session();

    if (id) {
      // TODO: nahradit voláním SessionService po napojení API
      this.editing.set(false);
      return;
    }

    // TODO: nahradit voláním SessionService po napojení API
    this.router.navigate(["/sessions"]);
  }

  protected onFormChanged(_form: SessionPayload): void {
    // TODO: uložit payload po napojení API
  }

  protected onGenerateInvoice(): void {
    // TODO: implementovat po napojení API
  }

  protected onSendSummary(): void {
    // TODO: implementovat po napojení API
  }

  protected onDelete(): void {
    // TODO: implementovat po napojení API
  }
}
