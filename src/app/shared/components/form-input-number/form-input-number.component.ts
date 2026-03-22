import { ChangeDetectionStrategy, Component, input, model } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FormValueControl } from "@angular/forms/signals";

import { InputNumber } from "primeng/inputnumber";

@Component({
  selector: "app-form-input-number",
  imports: [FormsModule, InputNumber],
  template: `
    <p-inputNumber
      [id]="id()"
      [ngModel]="value()"
      (ngModelChange)="value.set($event)"
      [min]="minValue()"
      [placeholder]="placeholder()"
      [invalid]="invalid()"
      [disabled]="disabled()"
      (onBlur)="touched.set(true)"
      class="w-full"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormInputNumberComponent implements FormValueControl<number | null> {
  readonly value = model<number | null>(null);

  readonly id = input<string | undefined>(undefined);
  readonly placeholder = input<string>("");
  readonly minValue = input<number>(0);

  readonly invalid = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly touched = model<boolean>(false);
}
