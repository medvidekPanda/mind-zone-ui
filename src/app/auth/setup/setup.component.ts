import { ChangeDetectionStrategy, Component, effect, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormField, FormRoot, form, required } from "@angular/forms/signals";
import { Router } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { InputTextModule } from "primeng/inputtext";

import { AuthService } from "../../shared/service/auth.service";
import { AuthStore } from "../../shared/store/auth.store";

type SetupFormModel = {
  firstName: string;
  lastName: string;
};

@Component({
  selector: "app-setup",
  imports: [ButtonModule, InputTextModule, CardModule, FormRoot, FormField],
  templateUrl: "./setup.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetupComponent {
  private readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly firebaseUser = toSignal(this.authService.currentUser$);

  private readonly setupModel = signal<SetupFormModel>({
    firstName: "",
    lastName: "",
  });

  protected readonly setupForm = form(
    this.setupModel,
    (s) => {
      required(s.firstName, { message: "Jméno je povinné" });
      required(s.lastName, { message: "Příjmení je povinné" });
    },
    {
      submission: {
        action: async () => {
          this.performSetup();
        },
      },
    },
  );

  protected readonly isLoading = this.authStore.isLoading;
  protected readonly error = this.authStore.error;

  constructor() {
    this.redirectOnRegistrationComplete();
  }

  private performSetup(): void {
    const user = this.firebaseUser();
    if (!user?.email || !user?.uid) return;

    const { firstName, lastName } = this.setupForm().value() as SetupFormModel;
    this.authStore.completeRegistration({
      firstName,
      lastName,
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
