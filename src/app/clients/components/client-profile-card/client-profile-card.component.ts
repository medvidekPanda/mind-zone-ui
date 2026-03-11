import { ChangeDetectionStrategy, Component, input } from "@angular/core";

import { AvatarModule } from "primeng/avatar";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";

import { Client, ClientStatus } from "../../../shared/interfaces/client.interface";

@Component({
  selector: "app-client-profile-card",
  standalone: true,
  imports: [AvatarModule, CardModule, TagModule],
  templateUrl: "./client-profile-card.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientProfileCardComponent {
  readonly client = input<Client | null>(null);
  readonly ClientStatus = ClientStatus;
}
