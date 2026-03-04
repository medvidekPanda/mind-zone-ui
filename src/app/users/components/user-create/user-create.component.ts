import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { RouterLink } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";

import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { User, UserPayload } from "../../../shared/interfaces/user.interface";
import { UserFormComponent } from "../user-form/user-form.component";

@Component({
  selector: "app-user-create",
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    UserFormComponent,
    PageHeaderComponent,
    RouterLink,
  ],
  templateUrl: "./user-create.component.html",
  host: { class: "flex flex-col" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCreateComponent {
  readonly user = input.required<User>();
  readonly save = output<void>();
  readonly cancel = output<void>();
  readonly formChanged = output<UserPayload>();
}
