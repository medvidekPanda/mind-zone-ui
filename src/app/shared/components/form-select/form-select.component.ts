import { ChangeDetectionStrategy, Component, input, model } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FormValueControl } from "@angular/forms/signals";

import { Select } from "primeng/select";

@Component({
  selector: "app-form-select",
  imports: [FormsModule, Select],
  templateUrl: "./form-select.component.html",
  host: { class: "contents" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSelectComponent<T = unknown> implements FormValueControl<T | null> {
  readonly value = model<T | null>(null);

  readonly options = input.required<{ label: string; value: T }[]>();

  readonly id = input<string | undefined>(undefined);
  readonly placeholder = input<string>("Vyberte");
  readonly showClear = input<boolean>(false);

  readonly invalid = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly touched = model<boolean>(false);
}
