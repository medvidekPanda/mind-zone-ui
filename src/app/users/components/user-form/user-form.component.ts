import { ChangeDetectionStrategy, Component, effect, input, model, output } from "@angular/core";
import { FormField, form, readonly, required } from "@angular/forms/signals";

import { CardModule } from "primeng/card";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";

import { FormSelectComponent } from "../../../shared/components/form-select/form-select.component";
import { User, UserPayload, UserRole } from "../../../shared/interfaces/user.interface";

type UserFormModel = Omit<User, "id" | "createdAt" | "updatedAt" | "role" | "firebaseId"> & {
  role: UserRole | null;
  firebaseId: string;
};

@Component({
  selector: "app-user-form",
  imports: [CardModule, FormField, FormSelectComponent, InputTextModule, SelectModule],
  templateUrl: "./user-form.component.html",
  host: { class: "flex flex-col" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent {
  readonly userModel = model<UserFormModel>({
    firstName: "",
    lastName: "",
    email: "",
    role: null,
    firebaseId: "",
  });

  readonly userDetail = input<User | undefined>(undefined);
  readonly readonly = input<boolean>(false);

  protected readonly roleOptions: { label: string; value: UserRole }[] = [
    { label: "Terapeut", value: UserRole.THERAPIST },
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

  readonly formChanged = output<UserPayload>();

  constructor() {
    this.initUserFormEffect();
    this.initUserModelEffect();
  }

  private initUserFormEffect(): void {
    effect(() => {
      const user = this.userDetail();

      if (user?.id) {
        const { firstName, lastName, email, role, firebaseId } = user;
        this.userModel.set({
          firstName,
          lastName,
          email,
          role,
          firebaseId: firebaseId ?? "",
        });
      }
    });
  }

  private initUserModelEffect(): void {
    effect(() => {
      const value = this.userForm().value();
      const isValid = this.userForm().valid();
      const dirty = this.userForm().dirty();

      if (value.role !== null && isValid && dirty) {
        this.formChanged.emit({
          ...value,
          role: value.role,
          firebaseId: value.firebaseId || null,
        });
      }
    });
  }
}
