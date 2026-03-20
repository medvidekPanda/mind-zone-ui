import { ChangeDetectionStrategy, Component, input, model } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { CheckboxModule } from "primeng/checkbox";
import { TagModule } from "primeng/tag";

@Component({
  selector: "app-session-payment-card",
  imports: [FormsModule, CheckboxModule, TagModule],
  templateUrl: "./session-payment-card.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionPaymentCardComponent {
  readonly price = input.required<number>();
  readonly paid = model<boolean>(false);
  readonly editable = input<boolean>(false);
}
