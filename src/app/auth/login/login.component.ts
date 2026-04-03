import { ChangeDetectionStrategy, Component, effect, inject, signal } from "@angular/core";
import { FormField, FormRoot, form, required } from "@angular/forms/signals";
import { Router } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { InputTextModule } from "primeng/inputtext";

import { AuthStore } from "../../shared/store/auth.store";

type LoginFormModel = {
  email: string;
  password: string;
};

@Component({
  selector: "app-login",
  imports: [ButtonModule, InputTextModule, CardModule, FormRoot, FormField],
  templateUrl: "./login.component.html",
  host: { class: "flex items-center justify-center h-screen" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  private readonly loginModel = signal<LoginFormModel>({
    email: "",
    password: "",
  });

  protected readonly loginForm = form(
    this.loginModel,
    (s) => {
      required(s.email, { message: "E-mail je povinný" });
      required(s.password, { message: "Heslo je povinné" });
    },
    {
      submission: {
        action: async () => {
          this.performLogin();
        },
      },
    },
  );

  protected readonly isLoading = this.authStore.isLoading;
  protected readonly error = this.authStore.error;

  constructor() {
    this.redirectOnAuthChange();
  }

  private performLogin(): void {
    const { email, password } = this.loginForm().value() as LoginFormModel;
    this.authStore.login({ email, password });
  }

  private redirectOnAuthChange(): void {
    effect(() => {
      if (this.authStore.needsRegistration()) {
        this.router.navigate(["/setup"]);
      } else if (this.authStore.isAuthenticated()) {
        this.router.navigate(["/dashboard"]);
      }
    });
  }
}
