import { ChangeDetectionStrategy, Component, computed, effect, inject } from "@angular/core";
import { rxResource, toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { of, take } from "rxjs";

import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { Client, ClientPayload } from "../../../shared/interfaces/client.interface";
import { ClientService } from "../../../shared/service/client.service";
import { ClientFormComponent } from "../client-form/client-form.component";
import { ClientStatsComponent } from "../client-stats/client-stats.component";

@Component({
  selector: "app-client-detail",
  imports: [ButtonModule, CardModule, ClientStatsComponent, PageHeaderComponent, ClientFormComponent],
  templateUrl: "./client-detail.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailComponent {
  private readonly clientService = inject(ClientService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private clientPayload: ClientPayload | undefined;

  private readonly clientResource = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => {
      const { id } = params;
      if (!id) return of({} as Client);

      return this.clientService.getClient(id);
    },
    defaultValue: {} as Client,
  });
  private readonly id = computed(() => this.paramMap()?.get("id") ?? undefined);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  protected readonly client = computed(() => this.clientResource.value());

  protected cancel(): void {
    this.router.navigate(["/clients"]);
  }

  protected onSave(): void {
    const { id } = this.client();

    if (!this.clientPayload) return;

    if (id) {
      this.clientService.updateClient(id, this.clientPayload).pipe(take(1)).subscribe();
      return;
    }

    this.clientService.createClient(this.clientPayload).pipe(take(1)).subscribe();
  }

  protected onFormChanged(form: ClientPayload): void {
    this.clientPayload = form;
  }
}
