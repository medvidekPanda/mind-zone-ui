import { ChangeDetectionStrategy, Component, computed, inject, input, model, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { Button } from "primeng/button";
import { DatePicker } from "primeng/datepicker";
import { Dialog } from "primeng/dialog";
import { Select } from "primeng/select";

import { SESSION_FORM_OPTIONS, SESSION_TYPE_OPTIONS } from "../../../shared/constants/session.constants";
import { SessionForm, SessionType } from "../../../shared/interfaces/session.interface";
import { ClientStore } from "../../../shared/store/client.store";
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
  imports: [FormsModule, Dialog, Button, DatePicker, Select],
  templateUrl: "./session-schedule-dialog.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionScheduleDialogComponent {
  private readonly clientStore = inject(ClientStore);

  readonly visible = model<boolean>(false);
  readonly clientId = input<string>("");

  readonly save = output<SchedulePayload>();

  protected readonly selectedClientId = signal<string | null>(null);
  protected readonly date = signal<Date | null>(null);
  protected readonly startTime = signal<Date | null>(roundToNext5Min(new Date()));
  protected readonly endTime = signal<Date | null>(null);
  protected readonly selectedForm = signal<SessionForm | null>(null);
  protected readonly selectedType = signal<SessionType | null>(null);

  protected readonly clientOptions = computed(() =>
    this.clientStore.clients().map((c) => ({ label: `${c.firstName} ${c.lastName}`, value: c.id })),
  );

  protected readonly formOptions = SESSION_FORM_OPTIONS;
  protected readonly typeOptions = SESSION_TYPE_OPTIONS;

  protected readonly duration = computed(() => {
    const start = this.startTime();
    const end = this.endTime();
    if (!start || !end) return null;
    const diffMin = Math.round((end.getTime() - start.getTime()) / 60000);
    return diffMin > 0 ? diffMin : null;
  });

  constructor() {
    this.clientStore.loadAll();

    const clientId = this.clientId();
    if (clientId) {
      this.selectedClientId.set(clientId);
    }
  }

  protected onSave(): void {
    this.save.emit({
      clientId: this.selectedClientId(),
      date: this.date(),
      startTime: this.startTime(),
      endTime: this.endTime(),
      form: this.selectedForm(),
      type: this.selectedType(),
    });
    this.visible.set(false);
  }

  protected close(): void {
    this.visible.set(false);
  }
}
