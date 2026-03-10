import { ChangeDetectionStrategy, Component, computed, effect, input, model, output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FormField, form, readonly, required } from "@angular/forms/signals";

import { CheckboxModule } from "primeng/checkbox";
import { DatePickerModule } from "primeng/datepicker";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { MultiSelectModule } from "primeng/multiselect";

import { FormDatepickerComponent } from "../../../shared/components/form-datepicker/form-datepicker.component";
import { FormSelectComponent } from "../../../shared/components/form-select/form-select.component";
import { Session, SessionFormat, SessionPayload, SessionType } from "../../../shared/interfaces/session.interface";

type SessionFormModel = {
  date: string | null;
  format: SessionFormat | null;
  type: SessionType | null;
  notes: string;
  nextPlan: string;
  clientId: string | null;
  therapistId: string | null;
};

@Component({
  selector: "app-session-form",
  imports: [
    FormsModule,
    FormField,
    FormDatepickerComponent,
    FormSelectComponent,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    CheckboxModule,
    MultiSelectModule,
  ],
  templateUrl: "./session-form.component.html",
  host: { class: "flex flex-col" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionFormComponent {
  readonly sessionModel = model<SessionFormModel>({
    date: null,
    format: null,
    type: null,
    notes: "",
    nextPlan: "",
    clientId: null,
    therapistId: null,
  });

  readonly sessionDetail = input<Session | undefined>(undefined);
  readonly readonly = input<boolean>(false);

  readonly startTime = model<Date | null>(SessionFormComponent.roundToNext5Min(new Date()));
  readonly endTime = model<Date | null>(null);
  readonly tags = model<string[]>([]);
  readonly price = model<number | null>(null);
  readonly paid = model<boolean>(false);

  protected readonly duration = computed(() => {
    const start = this.startTime();
    const end = this.endTime();
    if (!start || !end) return null;
    const diffMs = end.getTime() - start.getTime();
    const diffMin = Math.round(diffMs / 60000);
    return diffMin > 0 ? diffMin : null;
  });

  protected readonly formatOptions: { label: string; value: SessionFormat }[] = [
    { label: "Online", value: SessionFormat.ONLINE },
    { label: "Osobně", value: SessionFormat.IN_PERSON },
  ];

  protected readonly typeOptions: { label: string; value: SessionType }[] = [
    { label: "Individuální", value: SessionType.INDIVIDUAL },
    { label: "Párová", value: SessionType.COUPLE },
    { label: "Skupinová", value: SessionType.GROUP },
  ];

  protected readonly tagOptions = [
    { label: "Deprese", value: "deprese" },
    { label: "Úzkost", value: "úzkost" },
    { label: "Vztahy", value: "vztahy" },
    { label: "Trauma", value: "trauma" },
    { label: "Sebehodnocení", value: "sebehodnoceni" },
    { label: "Rodina", value: "rodina" },
  ];

  // Placeholder – to be loaded from API
  protected readonly therapistOptions = [{ label: "Anna Nováková", value: "1" }];
  protected readonly clientOptions = [
    { label: "Jan Novák", value: "c1" },
    { label: "Marie Svobodová", value: "c2" },
  ];

  protected readonly sessionForm = form(this.sessionModel, (schemaPath) => {
    required(schemaPath.date, { message: "Datum je povinné" });
    required(schemaPath.format, { message: "Forma je povinná" });
    required(schemaPath.type, { message: "Typ je povinný" });

    readonly(schemaPath.date, this.readonly);
    readonly(schemaPath.format, this.readonly);
    readonly(schemaPath.type, this.readonly);
    readonly(schemaPath.notes, this.readonly);
    readonly(schemaPath.nextPlan, this.readonly);
    readonly(schemaPath.clientId, this.readonly);
    readonly(schemaPath.therapistId, this.readonly);
  });

  readonly formChanged = output<SessionPayload>();

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

  constructor() {
    this.initDetailEffect();
    this.initOutputEffect();
  }

  private initDetailEffect(): void {
    effect(() => {
      const session = this.sessionDetail();
      if (!session) return;

      if (session.id) {
        const { date, format, type, notes, nextPlan, clientId, therapistId, time, duration, tags, price, paid } =
          session;

        this.sessionModel.set({ date, format, type, notes, nextPlan, clientId, therapistId });

        if (time) {
          const [hours, minutes] = time.split(":").map(Number);
          const start = new Date();
          start.setHours(hours, minutes, 0, 0);
          this.startTime.set(start);

          if (duration) {
            const end = new Date(start.getTime() + duration * 60000);
            this.endTime.set(end);
          }
        }

        this.tags.set(tags ?? []);
        this.price.set(price ?? null);
        this.paid.set(paid ?? false);
      } else if (session.clientId) {
        this.sessionModel.update((m) => ({ ...m, clientId: session.clientId }));
      }
    });
  }

  private initOutputEffect(): void {
    effect(() => {
      const value = this.sessionForm().value();
      const isValid = this.sessionForm().valid();
      const startTime = this.startTime();
      const duration = this.duration();
      const tags = this.tags();
      const price = this.price();
      const paid = this.paid();

      if (value.format !== null && value.type !== null && value.date !== null && duration !== null && isValid) {
        const timeStr = startTime
          ? `${String(startTime.getHours()).padStart(2, "0")}:${String(startTime.getMinutes()).padStart(2, "0")}`
          : "";

        this.formChanged.emit({
          date: value.date,
          time: timeStr,
          format: value.format,
          type: value.type,
          duration,
          notes: value.notes,
          nextPlan: value.nextPlan,
          clientId: value.clientId ?? "",
          therapistId: value.therapistId ?? "",
          tags,
          price: price ?? 0,
          paid,
        });
      }
    });
  }
}
