import { ChangeDetectionStrategy, Component, computed, effect, inject, output, signal } from "@angular/core";
import { FormField, form, readonly, required } from "@angular/forms/signals";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";

import { FormSelectComponent } from "../../../shared/components/form-select/form-select.component";
import { User, UserPayload, UserRole } from "../../../shared/interfaces/user.interface";
import { UserStore } from "../../../shared/store/user.store";

type UserFormModel = Omit<User, "id" | "createdAt" | "updatedAt" | "role" | "firebaseId"> & {
  role: UserRole | null;
  firebaseId: string;
};

@Component({
  selector: "app-user-form",
  imports: [ButtonModule, CardModule, FormField, FormSelectComponent, InputTextModule, SelectModule],
  templateUrl: "./user-form.component.html",
  host: { class: "contents" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent {
  private readonly userStore = inject(UserStore);

  private readonly formReadonly = computed(() => !this.isEditing());
  private readonly userModel = signal<UserFormModel>({
    firstName: "",
    lastName: "",
    email: "",
    role: null,
    firebaseId: "",
  });

  readonly cancelled = output<void>();

  constructor() {
    this.syncFormWithUserDetail();
  }

  protected readonly isEditing = computed(() => this.userStore.isEditing() || !this.userStore.user()?.id);
  protected readonly roleOptions: { label: string; value: UserRole }[] = [
    { label: "Uživatel", value: UserRole.USER },
    { label: "Administrátor", value: UserRole.ADMIN },
  ];
  protected readonly showActions = computed(() => this.isEditing());
  protected readonly userDetail = computed(() => this.userStore.user());
  protected readonly userForm = form(this.userModel, (schemaPath) => {
    required(schemaPath.firstName, { message: "Jméno je povinné" });
    required(schemaPath.lastName, { message: "Příjmení je povinné" });
    required(schemaPath.email, { message: "E-mail je povinný" });
    required(schemaPath.role, { message: "Role je povinná" });

    readonly(schemaPath.email, this.formReadonly);
    readonly(schemaPath.firebaseId, this.formReadonly);
    readonly(schemaPath.firstName, this.formReadonly);
    readonly(schemaPath.lastName, this.formReadonly);
    readonly(schemaPath.role, this.formReadonly);
  });

  protected cancel(): void {
    this.cancelled.emit();
  }

  protected save(): void {
    const userForm = this.userForm();
    if (!userForm.valid()) return;

    const value = userForm.value() as UserFormModel;
    if (value.role === null) return;

    const user = this.userDetail();
    const full: UserPayload = { ...value, role: value.role, firebaseId: value.firebaseId || null };

    if (user?.id) {
      const changed = (Object.keys(full) as (keyof UserPayload)[]).reduce(
        (accumulator, field) => (full[field] !== user[field] ? { ...accumulator, [field]: full[field] } : accumulator),
        {} as Partial<UserPayload>,
      );

      if (Object.keys(changed).length > 0) {
        this.userStore.updateUser({ id: user.id, payload: changed });
      } else {
        this.userStore.stopEditing();
      }
    } else {
      this.userStore.createUser(full);
    }
  }

  private syncFormWithUserDetail(): void {
    effect(() => {
      const user = this.userDetail();

      if (user?.id) {
        const { firstName, lastName, email, role, firebaseId } = user;
        this.userModel.set({
          firstName: firstName ?? "",
          lastName: lastName ?? "",
          email: email ?? "",
          role: role ?? null,
          firebaseId: firebaseId ?? "",
        });
      }
    });
  }
}
