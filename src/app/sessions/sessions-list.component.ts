import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";

import { FormSelectComponent } from "../shared/components/form-select/form-select.component";
import { ListReloadButtonComponent } from "../shared/components/list-reload-button/list-reload-button.component";
import { DeleteConfirmService } from "../shared/service/delete-confirm.service";
import { SESSION_FORM_OPTIONS } from "../shared/constants/session.constants";
import { AppStore } from "../shared/store/app.store";
import { SessionStore } from "../shared/store/session.store";

interface SessionRow {
  id: string;
  date: string;
  time: string;
  therapistName: string;
  clientName: string;
  plannedDurationMinutes: number;
  form: string;
  paid: boolean;
}

@Component({
  selector: "app-sessions-list",
  imports: [
    RouterLink,
    ButtonModule,
    TableModule,
    TagModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    FormSelectComponent,
    ListReloadButtonComponent,
  ],
  templateUrl: "./sessions-list.component.html",
  host: { class: "flex flex-col h-full" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsListComponent {
  private readonly appStore = inject(AppStore);
  private readonly deleteConfirm = inject(DeleteConfirmService);
  private readonly sessionStore = inject(SessionStore);

  protected readonly durationFilter = signal<number | null>(null);
  protected readonly formFilter = signal<string | null>(null);
  protected readonly paidFilter = signal<boolean | null>(null);

  protected readonly durationOptions = [
    { label: "45 min", value: 45 },
    { label: "60 min", value: 60 },
    { label: "90 min", value: 90 },
    { label: "120 min", value: 120 },
  ];

  protected readonly formOptions = SESSION_FORM_OPTIONS;
  protected readonly isLoading = this.sessionStore.isLoading;

  protected readonly paidOptions: { label: string; value: boolean | null }[] = [
    { label: "Zaplaceno", value: true },
    { label: "Čeká na úhradu", value: false },
  ];

  protected readonly sessions = computed<SessionRow[]>(() =>
    this.sessionStore.sessions().map((session) => {
      const sessionDate = new Date(session.date);
      const clientName = `${session.client.firstName} ${session.client.lastName}`;
      const therapistName = `${session.user.firstName} ${session.user.lastName}`;

      return {
        id: session.id,
        clientName,
        therapistName,
        plannedDurationMinutes: session.plannedDurationMinutes,
        paid: session.paid,
        date: sessionDate.toLocaleDateString("cs-CZ"),
        time: sessionDate.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" }),
        form: this.appStore.getSessionFormLabel(session.form),
      };
    }),
  );

  constructor() {
    this.sessionStore.loadAll();
  }

  protected deleteSession(sessionId: string): void {
    this.deleteConfirm.confirmDelete(() => {
      this.sessionStore.deleteSession(sessionId);
    });
  }

  protected onDurationFilterChange(
    value: number | null,
    table: { filter: (v: unknown, f: string, m: string) => void },
  ): void {
    this.durationFilter.set(value);
    table.filter(value, "plannedDurationMinutes", "equals");
  }

  protected onFormFilterChange(
    value: string | null,
    table: { filter: (v: unknown, f: string, m: string) => void },
  ): void {
    this.formFilter.set(value);
    table.filter(value, "form", "equals");
  }

  protected onPaidFilterChange(
    value: boolean | null,
    table: {
      filter: (v: unknown, f: string, m: string) => void;
      clearFilterValues: () => void;
      filterGlobal: (v: string, matchMode: string) => void;
    },
    globalFilterInput: HTMLInputElement,
  ): void {
    this.paidFilter.set(value);

    if (value === null) {
      table.clearFilterValues();
      table.filterGlobal(globalFilterInput.value, "contains");
    } else {
      table.filter(value, "paid", "equals");
    }
  }

  protected reloadSessions(): void {
    this.sessionStore.loadAll();
  }
}
