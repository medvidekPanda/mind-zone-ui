import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';

export interface ScheduleFormData {
  client: string | null;
  date: Date | null;
  time: Date | null;
  duration: number | null;
  form: string | null;
  type: string | null;
  therapist: string | null;
}

@Component({
  selector: 'app-session-schedule-dialog',
  standalone: true,
  imports: [FormsModule, DialogModule, ButtonModule, DatePickerModule, SelectModule],
  templateUrl: './session-schedule-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionScheduleDialogComponent {
  readonly visible = model<boolean>(false);

  readonly clientOptions = input.required<{ label: string; value: string }[]>();
  readonly therapistOptions = input.required<{ label: string; value: string }[]>();
  readonly durationOptions = input.required<{ label: string; value: number }[]>();
  readonly formOptions = input.required<{ label: string; value: string }[]>();
  readonly typeOptions = input.required<{ label: string; value: string }[]>();

  readonly save = output<ScheduleFormData>();

  protected schedule: ScheduleFormData = {
    client: null,
    date: null,
    time: null,
    duration: 60,
    form: null,
    type: null,
    therapist: null,
  };

  protected close(): void {
    this.visible.set(false);
  }

  protected onSave(): void {
    this.save.emit({ ...this.schedule });
    this.visible.set(false);
  }
}
