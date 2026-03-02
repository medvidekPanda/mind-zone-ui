import { ChangeDetectionStrategy, Component, computed, input, model } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FormValueControl } from "@angular/forms/signals";

import { DatePickerModule } from "primeng/datepicker";

@Component({
  selector: "app-form-datepicker",
  standalone: true,
  imports: [FormsModule, DatePickerModule],
  templateUrl: "./form-datepicker.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormDatepickerComponent implements FormValueControl<string | null> {
  readonly value = model<string | null>(null);

  readonly id = input<string | undefined>(undefined);
  readonly placeholder = input<string>("RRRR-MM-DD");
  readonly showClear = input<boolean>(false);

  readonly invalid = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly touched = model<boolean>(false);

  protected readonly valueAsDate = computed(() => {
    const v = this.value();
    if (v == null || v === "") return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  });

  protected setDate(d: Date | null): void {
    this.value.set(d ? this.formatIso(d) : null);
  }

  private formatIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
}
