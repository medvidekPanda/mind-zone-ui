import { ChangeDetectionStrategy, Component, model, output, signal } from "@angular/core";
import { FormField, FormRoot, form } from "@angular/forms/signals";

import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";

import { FormCheckboxComponent } from "../../../../../shared/components/form-checkbox/form-checkbox.component";
import { FormInputNumberComponent } from "../../../../../shared/components/form-input-number/form-input-number.component";

export interface UploadConfig {
  file: File;
  transcribe: boolean;
  speakerCount: number;
}

type UploadFormModel = {
  speakerCount: number;
  transcribe: boolean;
};

@Component({
  selector: "app-session-upload-dialog",
  imports: [DialogModule, ButtonModule, FormRoot, FormField, FormInputNumberComponent, FormCheckboxComponent],
  templateUrl: "./session-upload-dialog.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionUploadDialogComponent {
  readonly visible = model<boolean>(false);
  readonly confirm = output<UploadConfig>();

  protected readonly file = signal<File | null>(null);

  private readonly uploadModel = signal<UploadFormModel>({
    speakerCount: 2,
    transcribe: true,
  });

  protected readonly uploadForm = form(this.uploadModel);

  open(file: File): void {
    this.file.set(file);
    this.uploadModel.set({ speakerCount: 2, transcribe: true });
    this.visible.set(true);
  }

  protected close(): void {
    this.visible.set(false);
    this.file.set(null);
  }

  protected onConfirm(): void {
    const file = this.file();
    if (!file) return;

    const value = this.uploadForm().value() as UploadFormModel;
    this.confirm.emit({
      file,
      transcribe: value.transcribe,
      speakerCount: value.speakerCount,
    });
    this.close();
  }

  protected formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
