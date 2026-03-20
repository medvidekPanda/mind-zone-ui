import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";

import { UserRole } from "../shared/interfaces/user.interface";
import { UserStore } from "../shared/store/user.store";

@Component({
  selector: "app-users-list",
  imports: [
    RouterLink,
    FormsModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    SelectModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
  ],
  templateUrl: "./users-list.component.html",
  host: { class: "flex flex-col h-full" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent {
  private readonly userStore = inject(UserStore);

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

  protected deleteUser(id: string): void {
    this.userStore.deleteUser(id);
  }
}
