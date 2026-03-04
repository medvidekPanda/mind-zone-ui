import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { RouterLink } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";

import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { User, UserPayload } from "../../../shared/interfaces/user.interface";
import { UserFormComponent } from "../user-form/user-form.component";
import { UserProfileCardComponent } from "../user-profile-card/user-profile-card.component";
import { UserStatsComponent } from "../user-stats/user-stats.component";

@Component({
  selector: "app-user-edit",
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    UserFormComponent,
    UserProfileCardComponent,
    UserStatsComponent,
    PageHeaderComponent,
    RouterLink,
  ],
  templateUrl: "./user-edit.component.html",
  host: { class: "flex flex-col" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserEditComponent {
  readonly user = input.required<User>();
  readonly editing = input.required<boolean>();

  readonly save = output<void>();
  readonly cancelEdit = output<void>();
  readonly startEdit = output<void>();
  readonly formChanged = output<UserPayload>();
}
