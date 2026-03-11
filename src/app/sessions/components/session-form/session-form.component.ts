import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FormField, form, readonly, required } from "@angular/forms/signals";

import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { DatePickerModule } from "primeng/datepicker";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { MultiSelectModule } from "primeng/multiselect";
import { PanelModule } from "primeng/panel";
import { TagModule } from "primeng/tag";

import { FormDatepickerComponent } from "../../../shared/components/form-datepicker/form-datepicker.component";
import { FormSelectComponent } from "../../../shared/components/form-select/form-select.component";
import { Session, SessionFormat, SessionPayload, SessionType } from "../../../shared/interfaces/session.interface";
import { ClientStore } from "../../../shared/store/client.store";
import { SessionStore } from "../../../shared/store/session.store";
import { SessionAttachmentsComponent } from "../session-detail/components/session-attachments/session-attachments.component";

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
    ButtonModule,
    FormsModule,
    FormField,
    FormDatepickerComponent,
    FormSelectComponent,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    CheckboxModule,
    MultiSelectModule,
    PanelModule,
    TagModule,
    SessionAttachmentsComponent,
  ],
  templateUrl: "./session-form.component.html",
  host: { class: "flex flex-col" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionFormComponent {
  private readonly clientStore = inject(ClientStore);
  private readonly sessionStore = inject(SessionStore);

  private readonly sessionModel = signal<SessionFormModel>({
    date: null,
    format: null,
    type: null,
    notes: "",
    nextPlan: "",
    clientId: null,
    therapistId: null,
  });

  protected readonly sessionDetail = computed(() => this.sessionStore.session());
  protected readonly clients = computed(() => this.clientStore.clients());

  readonly clientId = input<string | null>(null);
  readonly readonly = input<boolean>(false);
  readonly showActions = input<boolean>(false);

  readonly startTime = model<Date | null>(SessionFormComponent.roundToNext5Min(new Date()));
  readonly endTime = model<Date | null>(null);
  readonly tags = model<string[]>([]);
  readonly price = model<number | null>(null);
  readonly paid = model<boolean>(false);

  readonly saved = output<void>();
  readonly cancelled = output<void>();

  protected clientOptions = computed(() =>
    this.clientStore.clients().map((client) => ({ label: `${client.firstName} ${client.lastName}`, value: client.id })),
  );

  protected readonly metaSummary = computed(() => {
    const { clientId, date } = this.sessionModel();
    const clientLabel = this.clientOptions().find((o) => o.value === clientId)?.label;
    const parts = [clientLabel, date].filter(Boolean);
    return parts.length ? parts.join(" · ") : "Základní údaje";
  });

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
    effect(() => {
      const clients = this.clientStore.clients();
      if (clients.length === 0) {
        this.clientStore.loadAll();
      }
    });

    effect(() => {
      const session = this.sessionDetail();
      const clientId = this.clientId();

      if (clientId) {
        this.sessionModel.update((m) => ({ ...m, clientId }));
      }

      if (!session?.id) return;

      const { date, format, type, notes, nextPlan, clientId: sClientId, therapistId, time, duration, tags, price, paid } = session;
      this.sessionModel.set({ date, format, type, notes, nextPlan, clientId: sClientId, therapistId });

      if (time) {
        const [hours, minutes] = time.split(":").map(Number);
        const start = new Date();
        start.setHours(hours, minutes, 0, 0);
        this.startTime.set(start);

        if (duration) {
          this.endTime.set(new Date(start.getTime() + duration * 60000));
        }
      }

      this.tags.set(tags ?? []);
      this.price.set(price ?? null);
      this.paid.set(paid ?? false);
    });
  }

  protected save(): void {
    const f = this.sessionForm();
    if (!f.valid()) return;

    const value = f.value() as SessionFormModel;
    if (!value.format || !value.type || !value.date) return;

    const duration = this.duration();
    if (!duration) return;

    const startTime = this.startTime();
    const timeStr = startTime
      ? `${String(startTime.getHours()).padStart(2, "0")}:${String(startTime.getMinutes()).padStart(2, "0")}`
      : "";

    const payload: SessionPayload = {
      date: value.date,
      time: timeStr,
      format: value.format,
      type: value.type,
      duration,
      notes: value.notes,
      nextPlan: value.nextPlan,
      clientId: value.clientId ?? "",
      therapistId: value.therapistId ?? "",
      tags: this.tags(),
      price: this.price() ?? 0,
      paid: this.paid(),
    };

    const session = this.sessionDetail();
    if (session?.id) {
      this.sessionStore.updateSession({ id: session.id, payload });
    } else {
      this.sessionStore.createSession(payload);
    }

    this.saved.emit();
  }

  protected cancel(): void {
    this.cancelled.emit();
  }
}
