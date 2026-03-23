import { ChangeDetectionStrategy, Component, model, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { DialogModule } from "primeng/dialog";
import { InputNumberModule } from "primeng/inputnumber";

export interface UploadConfig {
  file: File;
  transcribe: boolean;
  speakerCount: number;
}

@Component({
  selector: "app-session-upload-dialog",
  imports: [FormsModule, DialogModule, ButtonModule, InputNumberModule, CheckboxModule],
  templateUrl: "./session-upload-dialog.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionUploadDialogComponent {
  readonly visible = model<boolean>(false);
  readonly confirm = output<UploadConfig>();

  protected readonly file = signal<File | null>(null);
  protected readonly speakerCount = signal(2);
  protected readonly transcribe = signal(true);

  open(file: File): void {
    this.file.set(file);
    this.speakerCount.set(2);
    this.transcribe.set(true);
    this.visible.set(true);
  }

  protected close(): void {
    this.visible.set(false);
    this.file.set(null);
  }

  protected onConfirm(): void {
    const file = this.file();
    if (!file) return;

    this.confirm.emit({
      file,
      transcribe: this.transcribe(),
      speakerCount: this.speakerCount(),
    });
    this.close();
  }

  protected formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
