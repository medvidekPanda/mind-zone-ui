import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { MenuItem } from "primeng/api";
import { MenuModule } from "primeng/menu";

import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { UserStore } from "../../../shared/store/user.store";
import { UserFormComponent } from "../user-form/user-form.component";
import { UserProfileCardComponent } from "../user-profile-card/user-profile-card.component";
import { UserStatsComponent } from "../user-stats/user-stats.component";

@Component({
  selector: "app-user-detail",
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    MenuModule,
    PageHeaderComponent,
    RouterLink,
    UserFormComponent,
    UserProfileCardComponent,
    UserStatsComponent,
  ],
  templateUrl: "./user-detail.component.html",
  host: { class: "flex flex-col overflow-hidden h-full" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent {
  private readonly userStore = inject(UserStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  private readonly id = computed(() => this.paramMap()?.get("id") ?? undefined);

  protected readonly isNewUser: boolean = this.route.snapshot.data["isNew"];
  protected readonly user = computed(() => this.userStore.user());
  protected readonly editing = signal(this.isNewUser);

  protected readonly actionMenuItems: MenuItem[] = [
    { label: "Smazat uživatele", icon: "pi pi-trash", command: () => this.onDelete() },
  ];

  protected onDelete(): void {
    // TODO: implement after API integration
  }

  constructor() {
    if (this.isNewUser) {
      this.userStore.resetUser();
    } else {
      const id = this.id();
      if (id) {
        this.userStore.loadUser(id);
      }
    }
  }

  protected startEdit(): void {
    this.editing.set(true);
  }

  protected onSaved(): void {
    if (this.isNewUser) {
      this.router.navigate(["/users"]);
    } else {
      this.editing.set(false);
    }
  }

  protected onCancelled(): void {
    if (this.isNewUser) {
      this.router.navigate(["/users"]);
    } else {
      this.editing.set(false);
    }
  }
}
