import { ChangeDetectionStrategy, Component, effect, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";

import { AuthStore } from "../../shared/store/auth.store";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule, PasswordModule, CardModule],
  templateUrl: "./login.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected email = "";
  protected password = "";

  protected readonly isLoading = this.authStore.isLoading;
  protected readonly error = this.authStore.error;

  constructor() {
    effect(() => {
      if (this.authStore.needsRegistration()) {
        this.router.navigate(["/setup"]);
      } else if (this.authStore.isAuthenticated()) {
        this.router.navigate(["/dashboard"]);
      }
    });
  }

  protected onSubmit(): void {
    this.authStore.login({ email: this.email, password: this.password });
  }
}
