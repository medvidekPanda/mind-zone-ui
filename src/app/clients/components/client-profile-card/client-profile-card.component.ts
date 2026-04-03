import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";

import { AvatarModule } from "primeng/avatar";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";

import { Client, ClientStatus } from "../../../shared/interfaces/client.interface";
import { AppStore } from "../../../shared/store/app.store";

@Component({
  selector: "app-client-profile-card",
  imports: [AvatarModule, CardModule, TagModule],
  templateUrl: "./client-profile-card.component.html",
  host: { class: "contents" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientProfileCardComponent {
  private readonly appStore = inject(AppStore);

  readonly client = input<Client | null>(null);
  readonly ClientStatus = ClientStatus;

  protected readonly statusLabel = computed(() => {
    const status = this.client()?.status;
    return status ? this.appStore.getClientStatusLabel(status) : "";
  });
}
