import { ChangeDetectionStrategy, Component, input } from "@angular/core";

import { AvatarModule } from "primeng/avatar";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";

import { User, UserRole } from "../../../shared/interfaces/user.interface";

@Component({
  selector: "app-user-profile-card",
  standalone: true,
  imports: [AvatarModule, CardModule, TagModule],
  templateUrl: "./user-profile-card.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileCardComponent {
  readonly user = input<User | null>(null);
  readonly UserRole = UserRole;
}
