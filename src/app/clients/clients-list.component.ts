import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";

import { ClientStatus } from "../shared/interfaces/client.interface";
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
  private readonly clientStore = inject(ClientStore);

  protected readonly statusOptions: { label: string; value: ClientStatus }[] = [
    { label: "Aktivní", value: ClientStatus.ACTIVE },
    { label: "Neaktivní", value: ClientStatus.INACTIVE },
  ];

  protected readonly clients = computed(() => this.clientStore.clients());
  protected readonly ClientStatus = ClientStatus;

  protected readonly statusFilter = signal<ClientStatus | null>(null);

  constructor() {
    effect(() => {
      const clients = this.clientStore.clients();

      if (clients.length === 0) {
        this.clientStore.loadAll();
      }
    });
  }

  protected reloadClients(): void {
    this.clientStore.loadAll();
  }

  /**
   * @todo this is client-side filtering; we should use server-side filtering
   * Backend does not have filtering implemented yet
   */
  protected onStatusFilterChange(
    value: ClientStatus | null,
    table: {
      filter: (v: unknown, f: string, m: string) => void;
      clearFilterValues: () => void;
      filterGlobal: (v: string, matchMode: string) => void;
    },
    globalFilterInput: HTMLInputElement,
  ): void {
    this.statusFilter.set(value);
    if (value === null) {
      table.clearFilterValues();
      table.filterGlobal(globalFilterInput.value, "contains");
    } else {
      table.filter(value, "status", "equals");
    }
  }

  protected deleteClient(_id: string): void {
    this.clientStore.deleteClient(_id);
  }
}
