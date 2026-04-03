import { ChangeDetectionStrategy, Component } from "@angular/core";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";

@Component({
  selector: "app-client-stats",
  imports: [CardModule, ButtonModule],
  templateUrl: "./client-stats.component.html",
  host: { class: "flex flex-col gap-6" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientStatsComponent {}
