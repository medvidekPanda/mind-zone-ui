import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";

import { FormSelectComponent } from "../shared/components/form-select/form-select.component";
import { ListReloadButtonComponent } from "../shared/components/list-reload-button/list-reload-button.component";
import { DeleteConfirmService } from "../shared/service/delete-confirm.service";
import { UserRole } from "../shared/interfaces/user.interface";
import { UserStore } from "../shared/store/user.store";

@Component({
  selector: "app-users-list",
  imports: [
    RouterLink,
    ButtonModule,
    TableModule,
    InputTextModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    FormSelectComponent,
    ListReloadButtonComponent,
  ],
  templateUrl: "./users-list.component.html",
  host: { class: "flex flex-col h-full" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent {
  private readonly deleteConfirm = inject(DeleteConfirmService);
  private readonly userStore = inject(UserStore);

  protected readonly isLoading = this.userStore.isLoading;

  protected readonly roleOptions: { label: string; value: UserRole }[] = [
    { label: "Uživatel", value: UserRole.USER },
    { label: "Administrátor", value: UserRole.ADMIN },
  ];

  protected readonly users = computed(() => this.userStore.users());
  protected readonly UserRole = UserRole;

  protected readonly roleFilter = signal<UserRole | null>(null);

  constructor() {
    this.userStore.loadAll();
  }

  protected deleteUser(userId: string): void {
    this.deleteConfirm.confirmDelete(() => {
      this.userStore.deleteUser(userId);
    });
  }

  protected onRoleFilterChange(
    value: UserRole | null,
    table: {
      filter: (v: unknown, f: string, m: string) => void;
      clearFilterValues: () => void;
      filterGlobal: (v: string, matchMode: string) => void;
    },
    globalFilterInput: HTMLInputElement,
  ): void {
    this.roleFilter.set(value);
    if (value === null) {
      table.clearFilterValues();
      table.filterGlobal(globalFilterInput.value, "contains");
    } else {
      table.filter(value, "role", "equals");
    }
  }

  protected reloadUsers(): void {
    this.userStore.loadAll();
  }
}
