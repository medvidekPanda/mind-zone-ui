import { KeyValuePipe } from "@angular/common";
import { HttpEventType } from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { outputFromObservable, toObservable, toSignal } from "@angular/core/rxjs-interop";

import { ButtonDirective } from "primeng/button";
import { Tooltip } from "primeng/tooltip";
import {
  EMPTY,
  Subject,
  catchError,
  distinctUntilChanged,
  filter,
  map,
  merge,
  mergeMap,
  of,
  scan,
  share,
  startWith,
  switchMap,
  tap,
} from "rxjs";

import { SessionAttachment } from "../../../../../shared/interfaces/session.interface";
import { SessionService } from "../../../../../shared/service/session.service";
import { TranscriptionService } from "../../../../../shared/service/transcription.service";
import { SessionStore } from "../../../../../shared/store/session.store";
import { AttachmentStatusIconPipe } from "./attachment-status-icon.pipe";
import { AttachmentStatusLabelPipe } from "./attachment-status-label.pipe";
import { FileSizePipe } from "./file-size.pipe";

interface UploadProgress {
  status: "uploading" | "error";
  percent: number;
}

interface UploadEvent {
  type: "progress" | "complete" | "error";
  fileName: string;
  percent?: number;
  sessionId?: string;
}

@Component({
  selector: "app-session-attachments",
  imports: [ButtonDirective, Tooltip, KeyValuePipe, AttachmentStatusIconPipe, AttachmentStatusLabelPipe, FileSizePipe],
  templateUrl: "./session-attachments.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionAttachmentsComponent {
  private readonly sessionService = inject(SessionService);
  private readonly transcriptionService = inject(TranscriptionService);
  private readonly sessionStore = inject(SessionStore);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly audioUrls = signal(new Map<string, string>());

  readonly sessionId = input<string | null>(null);
  readonly attachments = input<SessionAttachment[]>([]);
  readonly pendingFiles = input<File[]>([]);

  readonly fileAdded = output<File>();
  readonly showTranscript = output<string>();

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>("fileInput");
  private readonly downloadTrigger$ = new Subject<{ sessionId: string; attachment: SessionAttachment }>();
  private readonly audioLoadTrigger$ = new Subject<{ sessionId: string; attachment: SessionAttachment }>();

  private readonly uploadTrigger$ = new Subject<{ sessionId: string; file: File }>();

  private readonly uploadEvents$ = this.uploadTrigger$.pipe(
    mergeMap(({ sessionId, file }) =>
      this.sessionService.uploadAttachmentWithProgress(sessionId, file).pipe(
        map((event): UploadEvent | null => {
          if (event.type === HttpEventType.UploadProgress) {
            const percent = event.total ? Math.round((event.loaded / event.total) * 100) : 0;
            return { type: "progress", fileName: file.name, percent };
          }
          if (event.type === HttpEventType.Response) {
            return { type: "complete", fileName: file.name, sessionId };
          }
          return null;
        }),
        filter((event): event is UploadEvent => event !== null),
        startWith({ type: "progress" as const, fileName: file.name, percent: 0 }),
        catchError(() => of<UploadEvent>({ type: "error", fileName: file.name })),
      ),
    ),
    share(),
  );

  readonly attachmentUploaded = outputFromObservable(
    this.uploadEvents$.pipe(
      filter((e): e is UploadEvent & { sessionId: string } => e.type === "complete" && !!e.sessionId),
      map((e) => e.sessionId),
    ),
  );

  protected readonly uploadStates = toSignal(
    this.uploadEvents$.pipe(
      scan((acc, event) => {
        const next = new Map(acc);

        if (event.type === "complete") {
          next.delete(event.fileName);
        } else if (event.type === "error") {
          next.set(event.fileName, { status: "error", percent: 0 });
        } else {
          next.set(event.fileName, { status: "uploading", percent: event.percent ?? 0 });
        }

        return next;
      }, new Map<string, UploadProgress>()),
      startWith(new Map<string, UploadProgress>()),
    ),
    { initialValue: new Map<string, UploadProgress>() },
  );

  private readonly inProgressIds = computed(() =>
    this.attachments()
      .filter((a) => a.processingStatus === "queued" || a.processingStatus === "processing")
      .map((a) => a.id),
  );

  private readonly transcriptionProgress$ = toObservable(
    computed(() => ({ sessionId: this.sessionId(), ids: this.inProgressIds() })),
  ).pipe(
    distinctUntilChanged((a, b) => a.sessionId === b.sessionId && a.ids.join() === b.ids.join()),
    switchMap(({ sessionId, ids }) => {
      if (!sessionId || ids.length === 0) return EMPTY;

      return merge(
        ...ids.map((attachmentId) =>
          this.transcriptionService.streamProgress(sessionId, attachmentId).pipe(
            tap((data) =>
              this.sessionStore.updateAttachmentStatus({
                attachmentId,
                status: data.status as "processing" | "completed" | "failed",
                progress: data.progress,
                error: data.error,
              }),
            ),
            filter((data) => data.status === "completed"),
            tap(() => this.sessionStore.loadSession(sessionId)),
            catchError(() => EMPTY),
          ),
        ),
      );
    }),
  );

  private readonly _trackProgress = toSignal(this.transcriptionProgress$);

  private readonly _downloads = toSignal(
    this.downloadTrigger$.pipe(
      mergeMap(({ sessionId, attachment }) =>
        this.sessionService.downloadAttachment(sessionId, attachment.id).pipe(
          tap((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = attachment.name;
            a.click();
            URL.revokeObjectURL(url);
          }),
          catchError(() => EMPTY),
        ),
      ),
    ),
  );

  private readonly _audioLoads = toSignal(
    this.audioLoadTrigger$.pipe(
      filter(({ attachment }) => !this.audioUrls().has(attachment.id)),
      mergeMap(({ sessionId, attachment }) =>
        this.sessionService.downloadAttachment(sessionId, attachment.id).pipe(
          tap((blob) => {
            const url = URL.createObjectURL(blob);
            this.audioUrls.update((m) => new Map(m).set(attachment.id, url));
          }),
          catchError(() => EMPTY),
        ),
      ),
    ),
  );

  constructor() {
    this.destroyRef.onDestroy(() => {
      for (const url of this.audioUrls().values()) URL.revokeObjectURL(url);
    });
  }

  protected readonly hasContent = computed(
    () => this.attachments().length > 0 || this.pendingFiles().length > 0 || this.uploadStates().size > 0,
  );

  protected openFilePicker(): void {
    this.fileInput()?.nativeElement.click();
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = "";

    for (const file of files) {
      const sessionId = this.sessionId();

      if (sessionId) {
        this.uploadTrigger$.next({ sessionId, file });
      } else {
        this.fileAdded.emit(file);
      }
    }
  }

  protected downloadAttachment(attachment: SessionAttachment): void {
    const sessionId = this.sessionId();
    if (!sessionId) return;

    this.downloadTrigger$.next({ sessionId, attachment });
  }

  protected async deleteAttachment(attachmentId: string): Promise<void> {
    const sessionId = this.sessionId();
    if (!sessionId) return;

    this.sessionStore.deleteAttachment({ sessionId, attachmentId });
  }

  protected retryTranscription(attachment: SessionAttachment): void {
    const sessionId = this.sessionId();
    if (!sessionId) return;

    this.sessionStore.triggerTranscription({ sessionId, attachmentId: attachment.id });
  }

  protected viewTranscript(attachment: SessionAttachment): void {
    this.showTranscript.emit(attachment.id);
  }

  protected isAudio(attachment: SessionAttachment): boolean {
    return attachment.mimeType?.startsWith("audio/") ?? false;
  }

  protected loadAudioUrl(attachment: SessionAttachment): void {
    const sessionId = this.sessionId();
    if (!sessionId) return;

    this.audioLoadTrigger$.next({ sessionId, attachment });
  }
}
