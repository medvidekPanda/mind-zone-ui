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
import { UserStore } from "../../../shared/store/user.store";
import { UserFormComponent } from "../user-form/user-form.component";
import { UserProfileCardComponent } from "../user-profile-card/user-profile-card.component";
import { UserStatsComponent } from "../user-stats/user-stats.component";

@Component({
  selector: "app-user-detail",
  imports: [
    ButtonModule,
    CardModule,
    MenuModule,
    SkeletonModule,
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
  private readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userStore = inject(UserStore);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  private readonly id = computed(() => this.paramMap()?.get("id"));

  protected readonly actionMenuItems: MenuItem[] = [
    { label: "Upravit uživatele", icon: "pi pi-user-edit", command: () => this.userStore.startEditing() },
    { label: "Smazat uživatele", icon: "pi pi-trash", command: () => this.onDelete() },
  ];
  protected readonly isEditing = this.userStore.isEditing;
  protected readonly isLoading = this.userStore.isLoading;
  protected readonly isNewUser = computed(() => !this.userStore.user()?.id);
  protected readonly user = computed(() => this.userStore.user());

  constructor() {
    effect(() => {
      const routeId = this.id();

      this.userStore.resetUser();

      if (routeId) {
        this.userStore.loadUser(routeId);
      } else {
        this.userStore.startEditing();
      }
    });

    effect(() => {
      const currentUser = this.userStore.user();

      if (!this.isNewUser() && currentUser?.id) {
        this.location.replaceState(`/users/${currentUser.id}`);
      }
    });
  }

  protected onCancelled(): void {
    if (this.isNewUser()) {
      this.router.navigate(["/users"]);
    } else {
      this.userStore.stopEditing();
    }
  }

  protected onDelete(): void {
    // TODO: implement after API integration
  }
}
