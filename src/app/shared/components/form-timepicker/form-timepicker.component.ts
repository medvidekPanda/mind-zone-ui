import { ChangeDetectionStrategy, Component, input, model } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FormValueControl } from "@angular/forms/signals";

import { DatePicker } from "primeng/datepicker";

@Component({
  selector: "app-form-timepicker",
  imports: [FormsModule, DatePicker],
  host: { class: "contents" },
  template: `
    <p-datepicker
      [id]="id()"
      [ngModel]="value()"
      (ngModelChange)="value.set($event)"
      timeOnly
      [placeholder]="placeholder()"
      [invalid]="invalid()"
      [disabled]="disabled()"
      (onBlur)="touched.set(true)"
      appendTo="body"
      class="w-full"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormTimepickerComponent implements FormValueControl<Date | null> {
  readonly value = model<Date | null>(null);

  readonly id = input<string | undefined>(undefined);
  readonly placeholder = input<string>("HH:mm");

  readonly invalid = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly touched = model<boolean>(false);
}
