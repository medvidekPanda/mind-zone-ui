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

import { CLIENT_STATUS_OPTIONS } from "../shared/constants/client.constants";
import { ClientStatus } from "../shared/interfaces/client.interface";
import { AppStore } from "../shared/store/app.store";
import { ClientStore } from "../shared/store/client.store";

@Component({
  selector: "app-clients-list",
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    SelectModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: "./clients-list.component.html",
  host: { class: "flex flex-col h-full" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsListComponent {
  private readonly appStore = inject(AppStore);
  private readonly clientStore = inject(ClientStore);

  protected readonly clients = computed(() =>
    this.clientStore.clients().map((client) => ({
      ...client,
      statusLabel: this.appStore.getClientStatusLabel(client.status),
    })),
  );
  protected readonly ClientStatus = ClientStatus;

  protected readonly statusFilter = signal<ClientStatus | null>(null);
  protected readonly statusOptions = CLIENT_STATUS_OPTIONS;

  constructor() {
    this.clientStore.loadAll();
  }

  protected reloadClients(): void {
    this.clientStore.loadAll();
  }

  protected onStatusFilterChange(
    status: ClientStatus | null,
    table: {
      filter: (v: unknown, f: string, m: string) => void;
      clearFilterValues: () => void;
      filterGlobal: (v: string, matchMode: string) => void;
    },
    globalFilterInput: HTMLInputElement,
  ): void {
    this.statusFilter.set(status);
    if (status === null) {
      table.clearFilterValues();
      table.filterGlobal(globalFilterInput.value, "contains");
    } else {
      table.filter(status, "status", "equals");
    }
  }

  protected deleteClient(_id: string): void {
    this.clientStore.deleteClient(_id);
  }
}
