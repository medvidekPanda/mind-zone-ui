import { ChangeDetectionStrategy, Component, effect, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { InputTextModule } from "primeng/inputtext";

import { UserRole } from "../../shared/interfaces/user.interface";
import { AuthService } from "../../shared/service/auth.service";
import { AuthStore } from "../../shared/store/auth.store";

@Component({
  selector: "app-setup",
  imports: [FormsModule, ButtonModule, InputTextModule, CardModule],
  templateUrl: "./setup.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetupComponent {
  private readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly firebaseUser = toSignal(this.authService.currentUser$);

  protected firstName = "";
  protected lastName = "";

  protected readonly isLoading = this.authStore.isLoading;
  protected readonly error = this.authStore.error;

  constructor() {
    this.redirectOnRegistrationComplete();
  }

  protected onSubmit(): void {
    const user = this.firebaseUser();
    if (!user?.email || !user?.uid) return;

    this.authStore.completeRegistration({
      firstName: this.firstName,
      lastName: this.lastName,
      email: user.email,
      firebaseId: user.uid,
    });
  }

  private redirectOnRegistrationComplete(): void {
    effect(() => {
      if (this.authStore.currentUser()) {
        this.router.navigate(["/dashboard"]);
      }
    });
  }
}
