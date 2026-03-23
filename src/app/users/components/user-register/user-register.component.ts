import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { FormField, FormRoot, form, required } from "@angular/forms/signals";
import { RouterLink } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { InputTextModule } from "primeng/inputtext";

import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";

type RegisterFormModel = {
  firebaseId: string;
  firstName: string;
  lastName: string;
};

@Component({
  selector: "app-user-register",
  imports: [PageHeaderComponent, RouterLink, ButtonModule, CardModule, InputTextModule, FormRoot, FormField],
  templateUrl: "./user-register.component.html",
  host: { class: "flex flex-col" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserRegisterComponent {
  private readonly registerModel = signal<RegisterFormModel>({
    firebaseId: "",
    firstName: "",
    lastName: "",
  });

  protected readonly registerForm = form(this.registerModel, (s) => {
    required(s.firebaseId, { message: "Firebase ID je povinné" });
    required(s.firstName, { message: "Jméno je povinné" });
    required(s.lastName, { message: "Příjmení je povinné" });
  });

  protected save(): void {
    // Placeholder – no API
  }
}
