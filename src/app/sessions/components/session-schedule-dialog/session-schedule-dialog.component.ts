import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from "@angular/core";
import { FormField, FormRoot, form, required } from "@angular/forms/signals";

import { Button } from "primeng/button";
import { DynamicDialogRef } from "primeng/dynamicdialog";

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
  imports: [Button, FormRoot, FormField, FormDatepickerComponent, FormSelectComponent, FormTimepickerComponent],
  templateUrl: "./session-schedule-dialog.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionScheduleDialogComponent {
  private readonly clientStore = inject(ClientStore);
  private readonly dynamicDialogRef = inject(DynamicDialogRef);

  readonly clientId = input<string>("");

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

  protected readonly clientOptions = computed(() => {
    const preselectedId = this.clientId();
    const current = this.clientStore.client();

    if (preselectedId && current?.id === preselectedId) {
      return [{ label: `${current.firstName} ${current.lastName}`, value: current.id }];
    }

    return this.clientStore.clients().map((c) => ({ label: `${c.firstName} ${c.lastName}`, value: c.id }));
  });

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
    this.syncClientId();
  }

  protected onSave(): void {
    const value = this.scheduleForm().value() as ScheduleFormModel;
    const payload: SchedulePayload = {
      clientId: value.clientId,
      date: value.date ? new Date(value.date) : null,
      startTime: value.startTime,
      endTime: value.endTime,
      form: value.form,
      type: value.type,
    };

    this.dynamicDialogRef.close(payload);
  }

  protected close(): void {
    this.dynamicDialogRef.close();
  }

  private syncClientId(): void {
    effect(() => {
      const clientId = this.clientId();

      if (clientId) {
        this.scheduleModel.update((model) => ({ ...model, clientId }));
      }
    });
  }
}
