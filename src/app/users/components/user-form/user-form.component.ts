import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from "@angular/core";
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
  host: { class: "flex flex-col" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent {
  private readonly userStore = inject(UserStore);

  private readonly userModel = signal<UserFormModel>({
    firstName: "",
    lastName: "",
    email: "",
    role: null,
    firebaseId: "",
  });

  readonly userDetail = computed(() => this.userStore.user());
  readonly readonly = input<boolean>(false);
  readonly showActions = input<boolean>(false);

  readonly saved = output<void>();
  readonly cancelled = output<void>();

  protected readonly roleOptions: { label: string; value: UserRole }[] = [
    { label: "Uživatel", value: UserRole.USER },
    { label: "Administrátor", value: UserRole.ADMIN },
  ];

  protected readonly userForm = form(this.userModel, (schemaPath) => {
    required(schemaPath.firstName, { message: "Jméno je povinné" });
    required(schemaPath.lastName, { message: "Příjmení je povinné" });
    required(schemaPath.email, { message: "E-mail je povinný" });
    required(schemaPath.role, { message: "Role je povinná" });

    readonly(schemaPath.role, this.readonly);
    readonly(schemaPath.firebaseId, this.readonly);
    readonly(schemaPath.firstName, this.readonly);
    readonly(schemaPath.lastName, this.readonly);
    readonly(schemaPath.email, this.readonly);
  });

  constructor() {
    this.syncFormWithUserDetail();
  }

  protected save(): void {
    const f = this.userForm();
    if (!f.valid()) return;

    const value = f.value() as UserFormModel;
    if (value.role === null) return;

    const user = this.userDetail();
    const full: UserPayload = { ...value, role: value.role, firebaseId: value.firebaseId || null };

    if (user?.id) {
      const changed = (Object.keys(full) as (keyof UserPayload)[]).reduce(
        (acc, key) => (full[key] !== user[key] ? { ...acc, [key]: full[key] } : acc),
        {} as Partial<UserPayload>,
      );

      if (Object.keys(changed).length > 0) {
        this.userStore.updateUser({
          id: user.id,
          payload: changed,
          onSuccess: () => this.saved.emit(),
        });
      } else {
        this.saved.emit();
      }
    } else {
      this.userStore.createUser({
        payload: full,
        onSuccess: () => this.saved.emit(),
      });
    }
  }

  protected cancel(): void {
    this.cancelled.emit();
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
