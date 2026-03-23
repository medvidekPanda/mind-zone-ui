import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output, signal } from "@angular/core";
import { FormField, FormRoot, form, required } from "@angular/forms/signals";

import { Button } from "primeng/button";
import { Dialog } from "primeng/dialog";

import { FormDatepickerComponent } from "../../../shared/components/form-datepicker/form-datepicker.component";
import { FormSelectComponent } from "../../../shared/components/form-select/form-select.component";
import { FormTimepickerComponent } from "../../../shared/components/form-timepicker/form-timepicker.component";
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

type ScheduleFormModel = {
  clientId: string | null;
  date: string | null;
  startTime: Date | null;
  endTime: Date | null;
  form: SessionForm | null;
  type: SessionType | null;
};

@Component({
  selector: "app-session-schedule-dialog",
  imports: [
    Dialog,
    Button,
    FormRoot,
    FormField,
    FormDatepickerComponent,
    FormSelectComponent,
    FormTimepickerComponent,
  ],
  templateUrl: "./session-schedule-dialog.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionScheduleDialogComponent {
  private readonly clientStore = inject(ClientStore);

  readonly visible = model<boolean>(false);
  readonly clientId = input<string>("");

  readonly save = output<SchedulePayload>();

  private readonly scheduleModel = signal<ScheduleFormModel>({
    clientId: null,
    date: null,
    startTime: roundToNext5Min(new Date()),
    endTime: null,
    form: null,
    type: null,
  });

  protected readonly scheduleForm = form(this.scheduleModel, (s) => {
    required(s.clientId, { message: "Klient je povinný" });
    required(s.date, { message: "Datum je povinné" });
  });

  protected readonly clientOptions = computed(() =>
    this.clientStore.clients().map((c) => ({ label: `${c.firstName} ${c.lastName}`, value: c.id })),
  );

  protected readonly formOptions = SESSION_FORM_OPTIONS;
  protected readonly typeOptions = SESSION_TYPE_OPTIONS;

  protected readonly duration = computed(() => {
    const start = this.scheduleForm.startTime().value();
    const end = this.scheduleForm.endTime().value();
    if (!start || !end) return null;
    const diffMin = Math.round((end.getTime() - start.getTime()) / 60000);
    return diffMin > 0 ? diffMin : null;
  });

  constructor() {
    this.clientStore.loadAll();
    this.syncClientId();
  }

  protected onSave(): void {
    const value = this.scheduleForm().value() as ScheduleFormModel;
    this.save.emit({
      clientId: value.clientId,
      date: value.date ? new Date(value.date) : null,
      startTime: value.startTime,
      endTime: value.endTime,
      form: value.form,
      type: value.type,
    });
    this.visible.set(false);
  }

  protected close(): void {
    this.visible.set(false);
  }

  private syncClientId(): void {
    effect(() => {
      const clientId = this.clientId();
      if (clientId) {
        this.scheduleModel.update((m) => ({ ...m, clientId }));
      }
    });
  }
}
