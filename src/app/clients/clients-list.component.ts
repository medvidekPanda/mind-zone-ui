import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { take } from "rxjs";

import { ClientStatus } from "../shared/interfaces/client.interface";
import { ClientService } from "../shared/service/client.service";

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
  private readonly clientService = inject(ClientService);

  private readonly clientListResource = rxResource({
    stream: () => this.clientService.getClients(),
    defaultValue: [],
  });

  protected readonly statusOptions: { label: string; value: ClientStatus }[] = [
    { label: "Aktivní", value: ClientStatus.ACTIVE },
    { label: "Neaktivní", value: ClientStatus.INACTIVE },
  ];

  protected readonly clients = computed(() => this.clientListResource.value());
  protected readonly ClientStatus = ClientStatus;

  protected readonly statusFilter = signal<ClientStatus | null>(null);

  /**
   * @todo toto je filtrace na straně frontendu, bychom měli použít filtrace na straně backendu
   * Na bekendu nemáme zatím filtraci hotovou
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
    this.clientService.deleteClient(_id).pipe(take(1)).subscribe();
  }
}
