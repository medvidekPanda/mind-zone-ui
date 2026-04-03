import { ChangeDetectionStrategy, Component, input, model } from "@angular/core";

import { TagModule } from "primeng/tag";

import { FormCheckboxComponent } from "../../../../../shared/components/form-checkbox/form-checkbox.component";

@Component({
  selector: "app-session-payment-card",
  imports: [FormCheckboxComponent, TagModule],
  templateUrl: "./session-payment-card.component.html",
  host: {
    class: "bg-surface-0 rounded-2xl border border-surface-200 shadow-sm overflow-hidden",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionPaymentCardComponent {
  readonly price = input.required<number>();
  readonly paid = model<boolean>(false);
  readonly editable = input<boolean>(false);
}
