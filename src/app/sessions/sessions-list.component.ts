import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";

import { SessionFormat } from "../shared/interfaces/session.interface";
import { SessionStore } from "../shared/store/session.store";

interface SessionRow {
  id: string;
  date: string;
  time: string;
  therapistName: string;
  clientName: string;
  duration: number;
  form: string;
  paid: boolean;
}

@Component({
  selector: "app-sessions-list",
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: "./sessions-list.component.html",
  host: { class: "flex flex-col h-full" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsListComponent {
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

  protected readonly formOptions = [
    { label: "Online", value: "online" },
    { label: "Osobně", value: "osobně" },
  ];

  protected readonly paidOptions: { label: string; value: boolean | null }[] = [
    { label: "Zaplaceno", value: true },
    { label: "Čeká na úhradu", value: false },
  ];

  protected readonly sessions = computed(() =>
    this.sessionStore.sessions().map((session) => ({
      ...session,
      form: session.format === SessionFormat.ONLINE ? "online" : "osobně",
    })),
  );

  constructor() {
    this.sessionStore.loadAll();
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

  protected onDurationFilterChange(
    value: number | null,
    table: { filter: (v: unknown, f: string, m: string) => void },
  ): void {
    this.durationFilter.set(value);
    table.filter(value, "duration", "equals");
  }

  protected onFormFilterChange(
    value: string | null,
    table: { filter: (v: unknown, f: string, m: string) => void },
  ): void {
    this.formFilter.set(value);
    table.filter(value, "form", "equals");
  }

  protected deleteSession(_id: string): void {
    // Placeholder – no API
  }
}
