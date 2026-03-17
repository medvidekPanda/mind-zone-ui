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
    const currentValue = this.value();
    if (currentValue == null || currentValue === "") return null;
    const parsedDate = new Date(currentValue);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  });

  protected setDate(selectedDate: Date | null): void {
    this.value.set(selectedDate ? this.formatIso(selectedDate) : null);
  }

  private formatIso(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
