import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { rxResource, toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";
import { of, take } from "rxjs";

import { Client, ClientPayload } from "../../../shared/interfaces/client.interface";
import { ClientService } from "../../../shared/service/client.service";
import { ClientCreateComponent } from "../client-create/client-create.component";
import { ClientEditComponent } from "../client-edit/client-edit.component";

@Component({
  selector: "app-client-detail",
  standalone: true,
  imports: [ButtonModule, CardModule, ClientCreateComponent, ClientEditComponent, TagModule],
  templateUrl: "./client-detail.component.html",
  host: { class: "flex flex-col" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailComponent {
  private readonly clientService = inject(ClientService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private clientPayload: ClientPayload | undefined;
  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  private readonly refreshTrigger = signal(0);

  protected readonly id = computed(() => this.paramMap()?.get("id") ?? undefined);

  private readonly clientResource = rxResource({
    params: () => ({ id: this.id(), refresh: this.refreshTrigger() }),
    stream: ({ params }) => {
      const { id } = params;
      if (!id) return of({} as Client);

      return this.clientService.getClient(id);
    },
    defaultValue: {} as Client,
  });

  protected readonly client = computed(() => this.clientResource.value());
  protected readonly editing = signal(false);
  protected readonly isNewClient = computed(() => !this.id());

  protected startEdit(): void {
    this.editing.set(true);
  }

  protected cancelEdit(): void {
    this.editing.set(false);
  }

  protected cancel(): void {
    if (this.id()) {
      this.cancelEdit();
    } else {
      this.router.navigate(["/clients"]);
    }
  }

  protected onSave(): void {
    const { id } = this.client();
    if (!this.clientPayload) return;

    if (id) {
      this.clientService
        .updateClient(id, this.clientPayload)
        .pipe(take(1))
        .subscribe(() => {
          this.refreshTrigger.update((v) => v + 1);
          this.editing.set(false);
        });
      return;
    }

    this.clientService
      .createClient(this.clientPayload)
      .pipe(take(1))
      .subscribe(() => {
        this.router.navigate(["/clients"]);
      });
  }

  protected onFormChanged(form: ClientPayload): void {
    this.clientPayload = form;
  }
}
