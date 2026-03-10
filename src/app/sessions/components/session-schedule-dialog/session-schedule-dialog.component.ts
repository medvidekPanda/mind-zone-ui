import { ChangeDetectionStrategy, Component, computed, input, model, output } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { ButtonModule } from "primeng/button";
import { DatePickerModule } from "primeng/datepicker";
import { DialogModule } from "primeng/dialog";
import { SelectModule } from "primeng/select";

import { SessionFormat, SessionType } from "../../../shared/interfaces/session.interface";

export interface SchedulePayload {
  clientId: string | null;
  therapistId: string | null;
  date: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  format: SessionFormat | null;
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

  protected readonly therapistOptions = [{ label: "Anna Nováková", value: "1" }];

  protected readonly formatOptions: { label: string; value: SessionFormat }[] = [
    { label: "Online", value: SessionFormat.ONLINE },
    { label: "Osobně", value: SessionFormat.IN_PERSON },
  ];

  protected readonly typeOptions: { label: string; value: SessionType }[] = [
    { label: "Individuální", value: SessionType.INDIVIDUAL },
    { label: "Párová", value: SessionType.COUPLE },
    { label: "Skupinová", value: SessionType.GROUP },
  ];

  protected readonly duration = computed(() => {
    const start = this.schedule.startTime;
    const end = this.schedule.endTime;
    if (!start || !end) return null;
    const diffMin = Math.round((end.getTime() - start.getTime()) / 60000);
    return diffMin > 0 ? diffMin : null;
  });

  protected schedule: SchedulePayload = {
    clientId: null,
    therapistId: null,
    date: null,
    startTime: SessionScheduleDialogComponent.roundToNext5Min(new Date()),
    endTime: null,
    format: null,
    type: null,
  };

  constructor() {
    const clientId = this.clientId();
    if (clientId) {
      this.schedule = { ...this.schedule, clientId };
    }
  }

  private static roundToNext5Min(date: Date): Date {
    const d = new Date(date);
    const min = d.getMinutes();
    const remainder = min % 5;
    if (remainder > 0) {
      d.setMinutes(min + (5 - remainder), 0, 0);
    } else {
      d.setSeconds(0, 0);
    }
    return d;
  }

  protected onSave(): void {
    this.save.emit({ ...this.schedule });
    this.visible.set(false);
  }

  protected close(): void {
    this.visible.set(false);
  }
}
