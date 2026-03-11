import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { RouterLink } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";

import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { Client, ClientPayload } from "../../../shared/interfaces/client.interface";
import { ClientFormComponent } from "../client-form/client-form.component";

@Component({
  selector: "app-client-create",
  standalone: true,
  imports: [ButtonModule, CardModule, ClientFormComponent, PageHeaderComponent, RouterLink],
  templateUrl: "./client-create.component.html",
  host: { class: "flex flex-col" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCreateComponent {
  readonly cancel = output<void>();
  readonly formChanged = output<ClientPayload>();
  readonly save = output<void>();
}
