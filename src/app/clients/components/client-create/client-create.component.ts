import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { RouterLink } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";

import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { Client, ClientPayload } from "../../../shared/interfaces/client.interface";
import { ClientFormComponent } from "../client-form/client-form.component";
import { ClientStatsComponent } from "../client-stats/client-stats.component";

@Component({
  selector: "app-client-create",
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    ClientFormComponent,
    ClientStatsComponent,
    PageHeaderComponent,
    RouterLink,
  ],
  templateUrl: "./client-create.component.html",
  host: { class: "flex flex-col" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCreateComponent {
  readonly client = input.required<Client>();
  readonly save = output<void>();
  readonly cancel = output<void>();
  readonly formChanged = output<ClientPayload>();
}
