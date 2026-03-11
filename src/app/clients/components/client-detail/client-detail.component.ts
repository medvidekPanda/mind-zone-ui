import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";

import { SessionScheduleDialogComponent } from "../../../sessions/components/session-schedule-dialog/session-schedule-dialog.component";
import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { ClientStore } from "../../../shared/store/client.store";
import { ClientFormComponent } from "../client-form/client-form.component";
import { ClientProfileCardComponent } from "../client-profile-card/client-profile-card.component";
import { ClientStatsComponent } from "../client-stats/client-stats.component";

@Component({
  selector: "app-client-detail",
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    ClientFormComponent,
    ClientProfileCardComponent,
    ClientStatsComponent,
    PageHeaderComponent,
    RouterLink,
    SessionScheduleDialogComponent,
  ],
  templateUrl: "./client-detail.component.html",
  host: { class: "flex flex-col" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailComponent {
  private readonly clientStore = inject(ClientStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  private readonly id = computed(() => this.paramMap()?.get("id") ?? undefined);

  protected readonly isNewClient: boolean = this.route.snapshot.data["isNew"];
  protected readonly client = computed(() => this.clientStore.client());
  protected readonly editing = signal(this.isNewClient);
  protected readonly scheduleDialogVisible = signal(false);

  constructor() {
    if (this.isNewClient) {
      this.clientStore.resetClient();
    } else {
      const id = this.id();
      if (id) {
        this.clientStore.loadClient(id);
      }
    }
  }

  protected startEdit(): void {
    this.editing.set(true);
  }

  protected cancelEdit(): void {
    this.editing.set(false);
  }

  protected onSaved(): void {
    if (this.isNewClient) {
      this.router.navigate(["/clients"]);
    } else {
      this.editing.set(false);
    }
  }

  protected onCancelled(): void {
    if (this.isNewClient) {
      this.router.navigate(["/clients"]);
    } else {
      this.editing.set(false);
    }
  }
}
