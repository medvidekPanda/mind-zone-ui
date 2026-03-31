import { Location } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, effect, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";

import { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { MenuModule } from "primeng/menu";
import { SkeletonModule } from "primeng/skeleton";

import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { SessionScheduleDialogService } from "../../../shared/service/session-schedule-dialog.service";
import { ClientStore } from "../../../shared/store/client.store";
import { ClientFormComponent } from "../client-form/client-form.component";
import { ClientProfileCardComponent } from "../client-profile-card/client-profile-card.component";
import { ClientStatsComponent } from "../client-stats/client-stats.component";

@Component({
  selector: "app-client-detail",
  imports: [
    ButtonModule,
    CardModule,
    MenuModule,
    SkeletonModule,
    ClientFormComponent,
    ClientProfileCardComponent,
    ClientStatsComponent,
    PageHeaderComponent,
    RouterLink,
  ],
  templateUrl: "./client-detail.component.html",
  host: { class: "flex flex-col overflow-hidden h-full" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailComponent {
  private readonly clientStore = inject(ClientStore);
  private readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionScheduleDialogService = inject(SessionScheduleDialogService);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  private readonly id = computed(() => this.paramMap()?.get("id"));

  protected readonly actionMenuItems: MenuItem[] = [
    { label: "Upravit klienta", icon: "pi pi-user-edit", command: () => this.clientStore.startEditing() },
    {
      label: "Naplánovat sezení",
      icon: "pi pi-calendar-plus",
      command: () => {
        const currentClient = this.client();
        if (currentClient?.id) {
          this.sessionScheduleDialogService.openDialog(currentClient.id);
        }
      },
    },
    { separator: true },
    { label: "Smazat klienta", icon: "pi pi-trash", command: () => this.onDelete() },
  ];

  protected readonly client = computed(() => this.clientStore.client());
  protected readonly isEditing = this.clientStore.isEditing;
  protected readonly isLoading = this.clientStore.isLoadingClient;
  protected readonly isNewClient = computed(() => !this.clientStore.client()?.id);

  constructor() {
    this.clientStore.resetClient();
    const id = this.id();

    if (id) {
      this.clientStore.loadClient(id);
    } else {
      this.clientStore.startEditing();
      this.replaceUrlAfterCreate();
    }
  }

  protected onCancelled(): void {
    if (this.isNewClient()) {
      this.router.navigate(["/clients"]);
    } else {
      this.clientStore.stopEditing();
    }
  }

  protected onDelete(): void {
    // TODO: implement after API integration
  }

  private replaceUrlAfterCreate(): void {
    effect(() => {
      const client = this.clientStore.client();

      if (!this.isNewClient() && client?.id) {
        this.location.replaceState(`/clients/${client.id}`);
      }
    });
  }
}
