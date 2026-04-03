import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from "@angular/core";
import { FormField, FormRoot, form, required } from "@angular/forms/signals";

import { Button } from "primeng/button";
import { DynamicDialogRef } from "primeng/dynamicdialog";

import { FormDatepickerComponent } from "../../../shared/components/form-datepicker/form-datepicker.component";
import { FormSelectComponent } from "../../../shared/components/form-select/form-select.component";
import { FormTimepickerComponent } from "../../../shared/components/form-timepicker/form-timepicker.component";
import { SESSION_FORM_OPTIONS, SESSION_TYPE_OPTIONS } from "../../../shared/constants/session.constants";
import { SessionForm, SessionType } from "../../../shared/interfaces/session.interface";
import { ClientStore } from "../../../shared/store/client.store";
import { toDateKey } from "../../../shared/utils/calendar.utils";
import { roundToNext5Min } from "../../../shared/utils/date.utils";

export interface SchedulePayload {
  clientId: string | null;
  /** Local calendar day from the form (`YYYY-MM-DD`); avoids UTC parsing bugs from `new Date("YYYY-MM-DD")`. */
  dateKey: string | null;
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
  host: { class: "flex flex-col gap-4 pt-1" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionScheduleDialogComponent {
  private readonly clientStore = inject(ClientStore);
  private readonly dynamicDialogRef = inject(DynamicDialogRef);

  readonly clientId = input<string>("");

  /** When set (e.g. from calendar slot), pre-fills date and start/end time. */
  readonly initialStartMs = input<number | undefined>(undefined);

  private readonly preselectedClientId = computed(() => this.clientId().trim());
  private readonly fromCalendarSlot = computed(() => this.initialStartMs() != null);

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
    const preselectedId = this.preselectedClientId();
    const current = this.clientStore.client();

    if (!this.fromCalendarSlot() && preselectedId && current?.id === preselectedId) {
      return [{ label: `${current.firstName} ${current.lastName}`, value: current.id }];
    }

    return this.clientStore.clients().map((client) => ({
      label: `${client.firstName} ${client.lastName}`,
      value: client.id,
    }));
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
    this.ensureFullClientListWhenPickAny();
    this.syncScheduleDialogInputs();
  }

  protected onSave(): void {
    const value = this.scheduleForm().value() as ScheduleFormModel;
    const payload: SchedulePayload = {
      clientId: value.clientId,
      dateKey: value.date,
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

  /** Load all clients when the dialog is not scoped to one pre-selected client (calendar, header, empty id). */
  private ensureFullClientListWhenPickAny(): void {
    effect(() => {
      const pickAnyClient = this.preselectedClientId().length === 0 || this.fromCalendarSlot();
      if (!pickAnyClient) return;
      untracked(() => {
        this.clientStore.loadAll();
      });
    });
  }

  private syncScheduleDialogInputs(): void {
    effect(() => {
      const fromCalendarSlotMs = this.initialStartMs();
      const preselectedClientId = this.preselectedClientId();

      if (fromCalendarSlotMs != null) {
        const start = new Date(fromCalendarSlotMs);
        const end = new Date(start.getTime() + 60 * 60_000);
        this.scheduleModel.set({
          clientId: null,
          date: toDateKey(start),
          startTime: new Date(start),
          endTime: end,
          form: null,
          type: null,
        });
        return;
      }

      if (preselectedClientId.length > 0) {
        this.scheduleModel.update((model) => ({ ...model, clientId: preselectedClientId }));
      }
    });
  }
}
