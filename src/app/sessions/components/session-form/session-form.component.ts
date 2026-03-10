import { ChangeDetectionStrategy, Component, effect, input, model, output } from "@angular/core";
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
  duration: number | null;
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
    duration: null,
    notes: "",
    nextPlan: "",
    clientId: null,
    therapistId: null,
  });

  readonly sessionDetail = input<Session | undefined>(undefined);
  readonly readonly = input<boolean>(false);

  readonly time = model<Date | null>(null);
  readonly tags = model<string[]>([]);
  readonly price = model<number | null>(null);
  readonly paid = model<boolean>(false);

  protected readonly formatOptions: { label: string; value: SessionFormat }[] = [
    { label: "Online", value: SessionFormat.ONLINE },
    { label: "Osobně", value: SessionFormat.IN_PERSON },
  ];

  protected readonly typeOptions: { label: string; value: SessionType }[] = [
    { label: "Individuální", value: SessionType.INDIVIDUAL },
    { label: "Párová", value: SessionType.COUPLE },
    { label: "Skupinová", value: SessionType.GROUP },
  ];

  protected readonly durationOptions: { label: string; value: number }[] = [
    { label: "45 min", value: 45 },
    { label: "60 min", value: 60 },
    { label: "90 min", value: 90 },
    { label: "120 min", value: 120 },
  ];

  protected readonly tagOptions = [
    { label: "Deprese", value: "deprese" },
    { label: "Úzkost", value: "úzkost" },
    { label: "Vztahy", value: "vztahy" },
    { label: "Trauma", value: "trauma" },
    { label: "Sebehodnocení", value: "sebehodnoceni" },
    { label: "Rodina", value: "rodina" },
  ];

  // Placeholder – bude načítáno z API
  protected readonly therapistOptions = [{ label: "Anna Nováková", value: "1" }];
  protected readonly clientOptions = [
    { label: "Jan Novák", value: "c1" },
    { label: "Marie Svobodová", value: "c2" },
  ];

  protected readonly sessionForm = form(this.sessionModel, (schemaPath) => {
    required(schemaPath.date, { message: "Datum je povinné" });
    required(schemaPath.format, { message: "Forma je povinná" });
    required(schemaPath.type, { message: "Typ je povinný" });
    required(schemaPath.duration, { message: "Délka je povinná" });

    readonly(schemaPath.date, this.readonly);
    readonly(schemaPath.format, this.readonly);
    readonly(schemaPath.type, this.readonly);
    readonly(schemaPath.duration, this.readonly);
    readonly(schemaPath.notes, this.readonly);
    readonly(schemaPath.nextPlan, this.readonly);
    readonly(schemaPath.clientId, this.readonly);
    readonly(schemaPath.therapistId, this.readonly);
  });

  readonly formChanged = output<SessionPayload>();

  constructor() {
    this.initDetailEffect();
    this.initOutputEffect();
  }

  private initDetailEffect(): void {
    effect(() => {
      const session = this.sessionDetail();

      if (session?.id) {
        const { date, format, type, duration, notes, nextPlan, clientId, therapistId, time, tags, price, paid } =
          session;

        this.sessionModel.set({ date, format, type, duration, notes, nextPlan, clientId, therapistId });

        if (time) {
          const [hours, minutes] = time.split(":").map(Number);
          const d = new Date();
          d.setHours(hours, minutes, 0, 0);
          this.time.set(d);
        }

        this.tags.set(tags ?? []);
        this.price.set(price ?? null);
        this.paid.set(paid ?? false);
      }
    });
  }

  private initOutputEffect(): void {
    effect(() => {
      const value = this.sessionForm().value();
      const isValid = this.sessionForm().valid();
      const time = this.time();
      const tags = this.tags();
      const price = this.price();
      const paid = this.paid();

      if (value.format !== null && value.type !== null && value.duration !== null && value.date !== null && isValid) {
        const timeStr = time
          ? `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`
          : "";

        this.formChanged.emit({
          date: value.date,
          time: timeStr,
          format: value.format,
          type: value.type,
          duration: value.duration,
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
