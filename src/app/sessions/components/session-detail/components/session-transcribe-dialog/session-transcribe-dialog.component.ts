import { ChangeDetectionStrategy, Component, model, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { InputNumberModule } from "primeng/inputnumber";

export interface TranscribeConfig {
  attachmentId: string;
  speakerCount: number;
}

@Component({
  selector: "app-session-transcribe-dialog",
  imports: [FormsModule, DialogModule, ButtonModule, InputNumberModule],
  templateUrl: "./session-transcribe-dialog.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionTranscribeDialogComponent {
  readonly visible = model<boolean>(false);
  readonly confirm = output<TranscribeConfig>();

  protected readonly attachmentId = signal<string | null>(null);
  protected readonly attachmentName = signal("");
  protected readonly speakerCount = signal(2);

  open(attachmentId: string, attachmentName: string): void {
    this.attachmentId.set(attachmentId);
    this.attachmentName.set(attachmentName);
    this.speakerCount.set(2);
    this.visible.set(true);
  }

  protected close(): void {
    this.visible.set(false);
  }

  protected onConfirm(): void {
    const id = this.attachmentId();
    if (!id) return;

    this.confirm.emit({ attachmentId: id, speakerCount: this.speakerCount() });
    this.close();
  }
}
