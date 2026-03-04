import { ChangeDetectionStrategy, Component } from "@angular/core";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";

@Component({
  selector: "app-user-stats",
  imports: [CardModule, ButtonModule],
  templateUrl: "./user-stats.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserStatsComponent {}
