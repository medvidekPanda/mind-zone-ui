import { KeyValuePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, output, signal, viewChild } from "@angular/core";

import { ButtonDirective } from "primeng/button";
import { Tooltip } from "primeng/tooltip";

import { SessionAttachment } from "../../../../../shared/interfaces/session.interface";
import { SessionStore } from "../../../../../shared/store/session.store";

type UploadState = "uploading" | "error";

@Component({
  selector: "app-session-attachments",
  standalone: true,
  imports: [ButtonDirective, Tooltip, KeyValuePipe],
  templateUrl: "./session-attachments.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionAttachmentsComponent {
  private readonly sessionStore = inject(SessionStore);

  readonly sessionId = input<string | null>(null);
  readonly attachments = input<SessionAttachment[]>([]);
  readonly pendingFiles = input<File[]>([]);

  readonly fileAdded = output<File>();

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>("fileInput");

  protected readonly uploadStates = signal<Map<string, UploadState>>(new Map());

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
        this.uploadFile(sessionId, file);
      } else {
        this.fileAdded.emit(file);
      }
    }
  }

  protected deleteAttachment(attachmentId: string): void {
    const sessionId = this.sessionId();
    if (!sessionId) return;
    this.sessionStore.deleteAttachment({ sessionId, attachmentId });
  }

  protected formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  protected getStatusIcon(status?: string): string {
    switch (status) {
      case "ready": return "pi-check-circle";
      case "transcribing": return "pi-spin pi-spinner";
      case "analyzing": return "pi-spin pi-spinner";
      case "error": return "pi-exclamation-circle";
      default: return "pi-clock";
    }
  }

  protected getStatusLabel(status?: string): string {
    switch (status) {
      case "ready": return "Připraveno";
      case "transcribing": return "Přepisuje se...";
      case "analyzing": return "Analyzuje se...";
      case "error": return "Chyba zpracování";
      default: return "Čeká na zpracování";
    }
  }

  private uploadFile(sessionId: string, file: File): void {
    this.uploadStates.update((map) => new Map(map).set(file.name, "uploading"));

    this.sessionStore.uploadAttachment({ sessionId, file });

    // Track upload result by watching attachments input for the new file
    const checkInterval = setInterval(() => {
      const found = this.attachments().some((a) => a.name === file.name);
      const hasError = this.sessionStore.error();

      if (found) {
        this.uploadStates.update((map) => {
          const next = new Map(map);
          next.delete(file.name);
          return next;
        });
        clearInterval(checkInterval);
      } else if (hasError) {
        this.uploadStates.update((map) => new Map(map).set(file.name, "error"));
        clearInterval(checkInterval);
      }
    }, 500);
  }
}
