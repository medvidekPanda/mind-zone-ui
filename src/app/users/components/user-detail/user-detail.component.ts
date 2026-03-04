import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { rxResource, toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";
import { of, take } from "rxjs";

import { User, UserPayload } from "../../../shared/interfaces/user.interface";
import { UserService } from "../../../shared/service/user.service";
import { UserCreateComponent } from "../user-create/user-create.component";
import { UserEditComponent } from "../user-edit/user-edit.component";

@Component({
  selector: "app-user-detail",
  standalone: true,
  imports: [ButtonModule, CardModule, UserCreateComponent, UserEditComponent, TagModule],
  templateUrl: "./user-detail.component.html",
  host: { class: "flex flex-col" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent {
  private readonly userService = inject(UserService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private userPayload: UserPayload | undefined;
  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  private readonly refreshTrigger = signal(0);

  protected readonly id = computed(() => this.paramMap()?.get("id") ?? undefined);

  private readonly userResource = rxResource({
    params: () => ({ id: this.id(), refresh: this.refreshTrigger() }),
    stream: ({ params }) => {
      const { id } = params;
      if (!id) return of({} as User);

      return this.userService.getUser(id);
    },
    defaultValue: {} as User,
  });

  protected readonly user = computed(() => this.userResource.value());
  protected readonly editing = signal(false);
  protected readonly isNewUser = computed(() => !this.id());

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
      this.router.navigate(["/users"]);
    }
  }

  protected onSave(): void {
    const { id } = this.user();
    if (!this.userPayload) return;

    if (id) {
      this.userService
        .updateUser(id, this.userPayload)
        .pipe(take(1))
        .subscribe(() => {
          this.refreshTrigger.update((v) => v + 1);
          this.editing.set(false);
        });
      return;
    }

    this.userService
      .createUser(this.userPayload)
      .pipe(take(1))
      .subscribe(() => {
        this.router.navigate(["/users"]);
      });
  }

  protected onFormChanged(form: UserPayload): void {
    this.userPayload = form;
  }
}
