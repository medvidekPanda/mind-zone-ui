import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from "@angular/core";
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
import { SESSION_FORM_OPTIONS, SESSION_TYPE_OPTIONS } from "../../../shared/constants/session.constants";
import { SessionForm, SessionPayload, SessionStatus, SessionType } from "../../../shared/interfaces/session.interface";
import { ClientStore } from "../../../shared/store/client.store";
import { SessionStore } from "../../../shared/store/session.store";
import { TagStore } from "../../../shared/store/tag.store";
import { roundToNext5Min } from "../../../shared/utils/date.utils";
import { SessionAttachmentsComponent } from "../session-detail/components/session-attachments/session-attachments.component";

type SessionFormModel = {
  date: string | null;
  form: SessionForm | null;
  type: SessionType | null;
  status: SessionStatus | null;
  notes: string;
  clientId: string | null;
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
  private readonly tagStore = inject(TagStore);

  private readonly saving = signal(false);
  private readonly sessionModel = signal<SessionFormModel>({
    date: null,
    form: null,
    type: null,
    status: SessionStatus.SCHEDULED,
    notes: "",
    clientId: null,
  });

  protected readonly sessionDetail = computed(() => this.sessionStore.session());
  protected readonly clients = computed(() => this.clientStore.clients());

  readonly clientId = input<string | null>(null);
  readonly readonly = input<boolean>(false);
  readonly showActions = input<boolean>(false);

  readonly startTime = model<Date | null>(roundToNext5Min(new Date()));
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
    return parts.length ? parts.join(" · ") : "Basic data";
  });

  protected readonly duration = computed(() => {
    const start = this.startTime();
    const end = this.endTime();
    if (!start || !end) return null;
    const diffMs = end.getTime() - start.getTime();
    const diffMin = Math.round(diffMs / 60000);
    return diffMin > 0 ? diffMin : null;
  });

  protected readonly formOptions = SESSION_FORM_OPTIONS;
  protected readonly typeOptions = SESSION_TYPE_OPTIONS;

  protected readonly tagOptions = computed(() =>
    this.tagStore.tags().map((tag) => ({ label: tag.name, value: tag.id })),
  );

  protected readonly sessionForm = form(this.sessionModel, (schemaPath) => {
    required(schemaPath.date, { message: "Datum je povinné" });
    required(schemaPath.form, { message: "Forma je povinná" });
    required(schemaPath.type, { message: "Typ je povinný" });

    readonly(schemaPath.date, this.readonly);
    readonly(schemaPath.form, this.readonly);
    readonly(schemaPath.type, this.readonly);
    readonly(schemaPath.notes, this.readonly);
    readonly(schemaPath.clientId, this.readonly);
  });

  constructor() {
    this.clientStore.loadAll();
    this.tagStore.loadAll();
    this.syncFormWithSessionDetail();
    this.handleSaveResult();
  }

  protected save(): void {
    const currentForm = this.sessionForm();
    console.log(currentForm);
    if (!currentForm.valid()) return;

    const formValue = currentForm.value() as SessionFormModel;
    if (!formValue.form || !formValue.type || !formValue.date) return;

    const plannedDurationMinutes = this.duration();
    if (!plannedDurationMinutes) return;

    const startTime = this.startTime();
    let combinedDateStr = formValue.date; // YYYY-MM-DD
    if (startTime) {
      const hours = String(startTime.getHours()).padStart(2, "0");
      const minutes = String(startTime.getMinutes()).padStart(2, "0");
      combinedDateStr = `${formValue.date}T${hours}:${minutes}:00.000Z`; // Manual says ISO 8601
      // Actually we should handle local timezone correctly if it's meant to be local, but ISO 8601 usually implies Z or offset.
      // The manual says: "2026-03-18T17:00:00.000Z"
    }

    const payload: SessionPayload = {
      date: combinedDateStr,
      form: formValue.form,
      type: formValue.type,
      status: formValue.status ?? SessionStatus.SCHEDULED,
      plannedDurationMinutes,
      notes: formValue.notes ?? "",
      clientId: formValue.clientId ?? "",
      tagIds: this.tags(),
      price: this.price() ?? 0,
      paid: this.paid(),
    };

    console.log(payload);

    this.saving.set(true);
    const session = this.sessionDetail();
    if (session?.id) {
      this.sessionStore.updateSession({ id: session.id, payload });
    } else {
      this.sessionStore.createSession(payload);
    }
  }

  protected cancel(): void {
    this.cancelled.emit();
  }

  private handleSaveResult(): void {
    effect(() => {
      if (!this.saving()) return;
      if (this.sessionStore.isLoading()) return;

      this.saving.set(false);
      if (!this.sessionStore.error()) {
        this.saved.emit();
      }
    });
  }

  private syncFormWithSessionDetail(): void {
    effect(() => {
      const session = this.sessionDetail();
      const clientId = this.clientId();

      if (clientId) {
        this.sessionModel.update((model) => ({ ...model, clientId }));
      }

      if (!session?.id) return;

      const {
        date: combinedDate,
        form: sForm,
        type,
        notes,
        clientId: sClientId,
        plannedDurationMinutes,
        tags: sTags,
        price,
        paid,
        status,
      } = session;

      // Parse combinedDate (ISO 8601) back into date (YYYY-MM-DD) and startTime (Date)
      let formattedDate = combinedDate;
      if (combinedDate.includes("T")) {
        const parsedDate = new Date(combinedDate);
        formattedDate = parsedDate.toISOString().split("T")[0];
        this.startTime.set(parsedDate);

        if (plannedDurationMinutes) {
          this.endTime.set(new Date(parsedDate.getTime() + plannedDurationMinutes * 60000));
        }
      }

      this.sessionModel.set({
        date: formattedDate,
        form: sForm,
        type,
        notes: notes ?? "",
        clientId: sClientId,
        status: status ?? SessionStatus.SCHEDULED,
      });

      const tagIds = sTags?.map((t) => t.id) ?? [];
      this.tags.set(tagIds);

      const parsedPrice = typeof price === "string" ? parseInt(price, 10) : (price ?? null);
      this.price.set(parsedPrice);
      this.paid.set(paid ?? false);
    });
  }
}
