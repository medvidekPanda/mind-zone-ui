import { Injectable, inject } from "@angular/core";

import { DialogService, type DynamicDialogRef } from "primeng/dynamicdialog";

import { SessionScheduleDialogComponent } from "../../sessions/components/session-schedule-dialog/session-schedule-dialog.component";

@Injectable({ providedIn: "root" })
export class SessionScheduleDialogService {
  private readonly dialogService = inject(DialogService);

  /**
   * @param clientId Optional pre-selected client (e.g. from client detail).
   * @param initialStartMs Optional slot start from calendar (UTC ms); pre-fills date and times in the dialog.
   */
  openDialog(clientId = "", initialStartMs?: number): DynamicDialogRef | null {
    return this.dialogService.open(SessionScheduleDialogComponent, {
      draggable: false,
      header: "Naplánovat sezení",
      inputValues: { clientId, initialStartMs },
      modal: true,
      resizable: false,
      styleClass: "w-full max-w-lg",
      width: "min(32rem, 95vw)",
    });
  }
}
