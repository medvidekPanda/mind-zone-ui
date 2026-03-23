import { ChangeDetectionStrategy, Component, model, output, signal } from "@angular/core";
import { FormField, FormRoot, form } from "@angular/forms/signals";

import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";

import { FormInputNumberComponent } from "../../../../../shared/components/form-input-number/form-input-number.component";

export interface TranscribeConfig {
  attachmentId: string;
  speakerCount: number;
}

type TranscribeFormModel = {
  speakerCount: number;
};

@Component({
  selector: "app-session-transcribe-dialog",
  imports: [DialogModule, ButtonModule, FormRoot, FormField, FormInputNumberComponent],
  templateUrl: "./session-transcribe-dialog.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionTranscribeDialogComponent {
  readonly visible = model<boolean>(false);
  readonly confirm = output<TranscribeConfig>();

  protected readonly attachmentId = signal<string | null>(null);
  protected readonly attachmentName = signal("");

  private readonly transcribeModel = signal<TranscribeFormModel>({
    speakerCount: 2,
  });

  protected readonly transcribeForm = form(this.transcribeModel);

  open(attachmentId: string, attachmentName: string): void {
    this.attachmentId.set(attachmentId);
    this.attachmentName.set(attachmentName);
    this.transcribeModel.set({ speakerCount: 2 });
    this.visible.set(true);
  }

  protected close(): void {
    this.visible.set(false);
  }

  protected onConfirm(): void {
    const id = this.attachmentId();
    if (!id) return;

    const value = this.transcribeForm().value() as TranscribeFormModel;
    this.confirm.emit({ attachmentId: id, speakerCount: value.speakerCount });
    this.close();
  }
}
