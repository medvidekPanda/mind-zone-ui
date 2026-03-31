import { Injectable, inject } from "@angular/core";

import { DialogService } from "primeng/dynamicdialog";

import { SessionScheduleDialogComponent } from "../../sessions/components/session-schedule-dialog/session-schedule-dialog.component";

@Injectable({ providedIn: "root" })
export class SessionScheduleDialogService {
  private readonly dialogService = inject(DialogService);

  openDialog(clientId = ""): void {
    this.dialogService.open(SessionScheduleDialogComponent, {
      header: "Naplánovat sezení",
      modal: true,
      draggable: false,
      resizable: false,
      width: "min(32rem, 95vw)",
      styleClass: "w-full max-w-lg",
      inputValues: { clientId },
    });
  }
}
