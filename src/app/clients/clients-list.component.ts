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

import { ClientService } from "../shared/service/client.service";

interface ClientRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: "active" | "inactive";
}

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

  protected readonly clients = computed(() => this.clientListResource.value());

  /**
   * @todo generovaný bordel
   */
  protected readonly searchText = signal("");
  protected readonly statusFilter = signal<string | null>(null);
  protected readonly statusOptions = signal([
    { label: "Všechny", value: null },
    { label: "Aktivní", value: "active" },
    { label: "Neaktivní", value: "inactive" },
  ]);

  protected deleteClient(_id: string): void {
    this.clientService.deleteClient(_id).pipe(take(1)).subscribe();
  }
}
