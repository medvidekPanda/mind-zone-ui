import { ChangeDetectionStrategy, Component, input, model } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FormValueControl } from "@angular/forms/signals";

import { Checkbox } from "primeng/checkbox";

@Component({
  selector: "app-form-checkbox",
  imports: [FormsModule, Checkbox],
  template: `
    <p-checkbox
      [inputId]="inputId()"
      [ngModel]="value()"
      (ngModelChange)="value.set($event)"
      [binary]="true"
      [disabled]="disabled()"
      (onBlur)="touched.set(true)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormCheckboxComponent implements FormValueControl<boolean> {
  readonly value = model<boolean>(false);

  readonly inputId = input<string | undefined>(undefined);

  readonly invalid = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly touched = model<boolean>(false);
}
