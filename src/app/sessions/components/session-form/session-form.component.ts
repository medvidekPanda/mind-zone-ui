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
import { FormField, FormRoot, form, readonly, required } from "@angular/forms/signals";

import { BadgeModule } from "primeng/badge";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TabsModule } from "primeng/tabs";
import { TagModule } from "primeng/tag";

import { FormDatepickerComponent } from "../../../shared/components/form-datepicker/form-datepicker.component";
import { FormInputNumberComponent } from "../../../shared/components/form-input-number/form-input-number.component";
import { FormMultiSelectComponent } from "../../../shared/components/form-multi-select/form-multi-select.component";
import { FormSelectComponent } from "../../../shared/components/form-select/form-select.component";
import { FormTimepickerComponent } from "../../../shared/components/form-timepicker/form-timepicker.component";
import { SESSION_FORM_OPTIONS, SESSION_TYPE_OPTIONS } from "../../../shared/constants/session.constants";
import { SessionForm, SessionPayload, SessionStatus, SessionType } from "../../../shared/interfaces/session.interface";
import { ClientStore } from "../../../shared/store/client.store";
import { SessionStore } from "../../../shared/store/session.store";
import { TagStore } from "../../../shared/store/tag.store";
import { roundToNext5Min } from "../../../shared/utils/date.utils";
import { SessionAttachmentsComponent } from "../session-detail/components/session-attachments/session-attachments.component";
import { SessionTranscriptViewerComponent } from "../session-transcript-viewer/session-transcript-viewer.component";

type SessionFormModel = {
  date: string | null;
  form: SessionForm | null;
  type: SessionType | null;
  status: SessionStatus | null;
  notes: string;
  summary: string;
  clientId: string | null;
  startTime: Date | null;
  endTime: Date | null;
  tags: string[];
  price: number | null;
  paid: boolean;
};

@Component({
  selector: "app-session-form",
  imports: [
    ButtonModule,
    FormField,
    FormRoot,
    FormDatepickerComponent,
    FormInputNumberComponent,
    FormMultiSelectComponent,
    FormSelectComponent,
    FormTimepickerComponent,
    InputTextModule,
    TagModule,
    SessionAttachmentsComponent,
    SessionTranscriptViewerComponent,
    TabsModule,
    BadgeModule,
  ],
  templateUrl: "./session-form.component.html",
  host: { class: "contents" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionFormComponent {
  private readonly clientStore = inject(ClientStore);
  private readonly sessionStore = inject(SessionStore);
  private readonly tagStore = inject(TagStore);

  private readonly formReadonly = computed(() => !this.isEditing());
  private readonly saving = signal(false);

  protected readonly pendingFiles = signal<File[]>([]);
  protected readonly attachments = computed(() => this.sessionDetail()?.attachments ?? []);
  protected readonly attachmentCount = computed(() => this.attachments().length + this.pendingFiles().length);
  protected readonly transcriptAttachment = computed(() =>
    this.attachments().find((attachment) => attachment.processingStatus === "completed" && attachment.transcript),
  );

  protected readonly hasProcessingAttachment = computed(() =>
    this.attachments().some(
      (attachment) => attachment.processingStatus === "queued" || attachment.processingStatus === "processing",
    ),
  );

  protected readonly activeTab = signal("notes");

  private readonly sessionModel = signal<SessionFormModel>({
    date: null,
    form: null,
    type: null,
    status: SessionStatus.SCHEDULED,
    notes: "",
    summary: "",
    clientId: null,
    startTime: roundToNext5Min(new Date()),
    endTime: null,
    tags: [],
    price: null,
    paid: false,
  });

  protected readonly sessionDetail = computed(() => this.sessionStore.session());
  protected readonly clients = computed(() => this.clientStore.clients());

  readonly clientId = input<string | null>(null);
  readonly paid = model<boolean>(false);

  protected clientOptions = computed(() => {
    const options = this.clientStore.clients().map((client) => ({
      label: `${client.firstName} ${client.lastName}`,
      value: client.id,
    }));

    const session = this.sessionDetail();

    if (session?.clientId && session?.client && !options.find((option) => option.value === session.clientId)) {
      options.push({ label: `${session.client.firstName} ${session.client.lastName}`, value: session.clientId });
    }
    return options;
  });

  protected readonly duration = computed(() => {
    const start = this.sessionForm.startTime().value();
    const end = this.sessionForm.endTime().value();
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

  protected readonly sessionForm = form(
    this.sessionModel,
    (schemaPath) => {
      required(schemaPath.clientId, { message: "Klient je povinný" });
      required(schemaPath.date, { message: "Datum je povinné" });
      required(schemaPath.form, { message: "Forma je povinná" });
      required(schemaPath.type, { message: "Typ je povinný" });
      required(schemaPath.startTime, { message: "Začátek je povinný" });

      readonly(schemaPath.date, this.formReadonly);
      readonly(schemaPath.form, this.formReadonly);
      readonly(schemaPath.type, this.formReadonly);
      readonly(schemaPath.notes, this.formReadonly);
      readonly(schemaPath.summary, this.formReadonly);
      readonly(schemaPath.clientId, this.formReadonly);
      readonly(schemaPath.startTime, this.formReadonly);
      readonly(schemaPath.endTime, this.formReadonly);
      readonly(schemaPath.tags, this.formReadonly);
      readonly(schemaPath.price, this.formReadonly);
      readonly(schemaPath.paid, this.formReadonly);
    },
    {
      submission: {
        action: async () => {
          this.performSave();
        },
      },
    },
  );

  protected readonly isEditing = computed(() => this.sessionStore.isEditing() || !this.sessionStore.session()?.id);
  protected readonly showActions = computed(() => this.isEditing());

  readonly cancelled = output<void>();

  constructor() {
    this.clientStore.loadAll();
    this.tagStore.loadAll();
    this.syncFormWithSessionDetail();
    this.handleSaveResult();
  }

  private performSave(): void {
    const formValue = this.sessionForm().value() as SessionFormModel;
    if (!formValue.form || !formValue.type || !formValue.date || !formValue.startTime) return;

    const endTime = formValue.endTime ?? new Date();
    const diffMs = endTime.getTime() - formValue.startTime.getTime();
    const plannedDurationMinutes = Math.max(1, Math.round(diffMs / 60000));

    const hours = String(formValue.startTime.getHours()).padStart(2, "0");
    const minutes = String(formValue.startTime.getMinutes()).padStart(2, "0");
    const combinedDateStr = `${formValue.date}T${hours}:${minutes}:00.000Z`;

    const payload: SessionPayload = {
      date: combinedDateStr,
      form: formValue.form,
      type: formValue.type,
      status: formValue.status ?? SessionStatus.SCHEDULED,
      plannedDurationMinutes,
      notes: formValue.notes ?? "",
      clientId: formValue.clientId ?? "",
      tagIds: formValue.tags,
      price: formValue.price ?? 0,
      paid: formValue.paid,
    };

    this.saving.set(true);
    const session = this.sessionDetail();

    if (session?.id) {
      this.sessionStore.updateSession({ id: session.id, payload });
    } else {
      this.sessionStore.createSession(payload);
    }
  }

  protected onFileAdded(file: File): void {
    this.pendingFiles.update((files) => [...files, file]);
  }

  protected onAttachmentUploaded(sessionId: string) {
    this.sessionStore.loadSession(sessionId);
  }

  protected onShowTranscript(): void {
    this.activeTab.set("transcription");
  }

  private handleSaveResult(): void {
    effect(() => {
      if (!this.saving() || this.sessionStore.isLoading()) return;

      this.saving.set(false);

      if (!this.sessionStore.error()) {
        const session = this.sessionStore.session();
        const files = this.pendingFiles();

        if (session?.id && files.length > 0) {
          for (const file of files) {
            this.sessionStore.uploadAttachment({ sessionId: session.id, file });
          }
          this.pendingFiles.set([]);
        }
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
        summary,
        clientId: sClientId,
        plannedDurationMinutes,
        tags: sTags,
        price,
        paid,
        status,
      } = session;

      let formattedDate = combinedDate;
      let startTime: Date | null = null;
      let endTime: Date | null = null;
      if (combinedDate.includes("T")) {
        const parsedDate = new Date(combinedDate);
        formattedDate = parsedDate.toISOString().split("T")[0];
        startTime = parsedDate;
        if (plannedDurationMinutes) {
          endTime = new Date(parsedDate.getTime() + plannedDurationMinutes * 60000);
        }
      }

      const parsedPrice = typeof price === "string" ? parseInt(price, 10) : (price ?? null);
      const tagIds = sTags?.map((t) => t.id) ?? [];

      this.sessionModel.set({
        date: formattedDate,
        form: sForm,
        type,
        notes: notes ?? "",
        summary: summary ?? "",
        clientId: sClientId,
        status: status ?? SessionStatus.SCHEDULED,
        startTime,
        endTime,
        tags: tagIds,
        price: parsedPrice,
        paid: paid ?? false,
      });

      this.paid.set(paid ?? false);
    });
  }
}
