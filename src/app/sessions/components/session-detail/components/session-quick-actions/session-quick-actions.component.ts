import { ChangeDetectionStrategy, Component, output } from "@angular/core";

import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";

@Component({
  selector: "app-session-quick-actions",
  standalone: true,
  imports: [ButtonModule, DividerModule],
  templateUrl: "./session-quick-actions.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionQuickActionsComponent {
  readonly generateInvoice = output<void>();
  readonly sendSummary = output<void>();
  readonly delete = output<void>();
}
