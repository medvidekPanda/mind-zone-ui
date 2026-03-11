import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from "@angular/core";
import { rxResource, toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";
import { of, take } from "rxjs";

import { Client, ClientPayload } from "../../../shared/interfaces/client.interface";
import { ClientStore } from "../../../shared/store/client.store";
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
  private readonly clientStore = inject(ClientStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private clientPayload: ClientPayload | undefined;
  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  protected readonly id = computed(() => this.paramMap()?.get("id") ?? undefined);

  protected readonly client = computed(() => this.clientStore.client());
  protected readonly editing = signal(false);
  protected readonly isNewClient = computed(() => !this.id());

  constructor() {
    const id = this.id();
    if (id) {
      this.clientStore.loadClient(id);
    }

    effect(() => {
      const isLoading = this.clientStore.isLoading();
      console.log("isLoading", isLoading);
    });
  }

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
    const id = this.client()?.id;
    if (!this.clientPayload) return;

    if (id) {
      this.clientStore.updateClient({ id, payload: this.clientPayload });
      return;
    }

    this.clientStore.createClient(this.clientPayload);
  }

  protected onFormChanged(form: ClientPayload): void {
    this.clientPayload = form;
  }
}
