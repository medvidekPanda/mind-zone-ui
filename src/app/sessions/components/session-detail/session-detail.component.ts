import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";

import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { Session, SessionFormat, SessionPayload, SessionType } from "../../../shared/interfaces/session.interface";
import { SessionFormComponent } from "../session-form/session-form.component";
import { SessionAttachmentsComponent } from "./components/session-attachments/session-attachments.component";
import { SessionPaymentCardComponent } from "./components/session-payment-card/session-payment-card.component";
import { SessionQuickActionsComponent } from "./components/session-quick-actions/session-quick-actions.component";

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
  private readonly queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly id = computed(() => this.paramMap()?.get("id") ?? undefined);

  protected readonly session = computed(() => {
    const found = MOCK_SESSIONS.find((s) => s.id === this.id());
    if (found) return found;

    const clientId = this.queryParams()?.get("clientId") ?? "";
    return { clientId } as Session;
  });
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
      // TODO: replace with SessionService call after API integration
      this.editing.set(false);
      return;
    }

    // TODO: replace with SessionService call after API integration
    this.router.navigate(["/sessions"]);
  }

  protected onFormChanged(_form: SessionPayload): void {
    // TODO: save payload after API integration
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
}
