import { ChangeDetectionStrategy, Component, input, model } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FormValueControl } from "@angular/forms/signals";

import { MultiSelect } from "primeng/multiselect";

@Component({
  selector: "app-form-multi-select",
  imports: [FormsModule, MultiSelect],
  template: `
    <p-multiSelect
      [id]="id()"
      [ngModel]="value()"
      (ngModelChange)="value.set($event)"
      [options]="options()"
      [optionLabel]="optionLabel()"
      [optionValue]="optionValue()"
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
export class FormMultiSelectComponent<T = unknown> implements FormValueControl<T[]> {
  readonly value = model<T[]>([]);

  readonly options = input.required<{ label: string; value: T }[]>();

  readonly id = input<string | undefined>(undefined);
  readonly placeholder = input<string>("Vyberte");
  readonly optionLabel = input<string>("label");
  readonly optionValue = input<string>("value");

  readonly invalid = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly touched = model<boolean>(false);
}
