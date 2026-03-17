import { ChangeDetectionStrategy, Component, computed, input, model, output } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { ButtonModule } from "primeng/button";
import { DatePickerModule } from "primeng/datepicker";
import { DialogModule } from "primeng/dialog";
import { SelectModule } from "primeng/select";

import { SESSION_FORM_OPTIONS, SESSION_TYPE_OPTIONS } from "../../../shared/constants/session.constants";
import { SessionForm, SessionType } from "../../../shared/interfaces/session.interface";
import { roundToNext5Min } from "../../../shared/utils/date.utils";

export interface SchedulePayload {
  clientId: string | null;
  date: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  form: SessionForm | null;
  type: SessionType | null;
}

@Component({
  selector: "app-session-schedule-dialog",
  standalone: true,
  imports: [FormsModule, DialogModule, ButtonModule, DatePickerModule, SelectModule],
  templateUrl: "./session-schedule-dialog.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionScheduleDialogComponent {
  readonly visible = model<boolean>(false);
  readonly clientId = input<string>("");

  readonly save = output<SchedulePayload>();

  protected readonly clientOptions = [
    { label: "Jan Novák", value: "c1" },
    { label: "Marie Svobodová", value: "c2" },
  ];

  protected readonly formOptions = SESSION_FORM_OPTIONS;
  protected readonly typeOptions = SESSION_TYPE_OPTIONS;

  protected readonly duration = computed(() => {
    const start = this.schedule.startTime;
    const end = this.schedule.endTime;
    if (!start || !end) return null;
    const diffMin = Math.round((end.getTime() - start.getTime()) / 60000);
    return diffMin > 0 ? diffMin : null;
  });

  protected schedule: SchedulePayload = {
    clientId: null,
    date: null,
    startTime: roundToNext5Min(new Date()),
    endTime: null,
    form: null,
    type: null,
  };

  constructor() {
    const clientId = this.clientId();
    if (clientId) {
      this.schedule = { ...this.schedule, clientId };
    }
  }

  protected onSave(): void {
    this.save.emit({ ...this.schedule });
    this.visible.set(false);
  }

  protected close(): void {
    this.visible.set(false);
  }
}
