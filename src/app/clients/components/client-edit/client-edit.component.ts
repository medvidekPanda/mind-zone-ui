import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { RouterLink } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";

import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { Client, ClientPayload } from "../../../shared/interfaces/client.interface";
import { ClientFormComponent } from "../client-form/client-form.component";
import { ClientProfileCardComponent } from "../client-profile-card/client-profile-card.component";
import { ClientStatsComponent } from "../client-stats/client-stats.component";

@Component({
  selector: "app-client-edit",
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    ClientFormComponent,
    ClientProfileCardComponent,
    ClientStatsComponent,
    PageHeaderComponent,
    RouterLink,
  ],
  templateUrl: "./client-edit.component.html",
  host: { class: "flex flex-col" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientEditComponent {
  readonly client = input.required<Client>();
  readonly editing = input.required<boolean>();

  readonly save = output<void>();
  readonly cancelEdit = output<void>();
  readonly startEdit = output<void>();
  readonly formChanged = output<ClientPayload>();
}
