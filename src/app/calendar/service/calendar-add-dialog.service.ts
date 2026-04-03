import { Injectable, inject } from "@angular/core";

import { filter, take } from "rxjs";

import type { SchedulePayload } from "../../sessions/components/session-schedule-dialog/session-schedule-dialog.component";
import type { WeekDay } from "../../shared/interfaces/calendar.interface";
import { SessionScheduleDialogService } from "../../shared/service/session-schedule-dialog.service";
import { CalendarPageStore } from "../../shared/store/calendar-page.store";
import { combineLocalDateKeyAndTime, composeDayTime, snapToGrid } from "../../shared/utils/calendar.utils";

@Injectable()
export class CalendarAddDialogService {
  private readonly calendarPageStore = inject(CalendarPageStore);

  private readonly sessionScheduleDialogService = inject(SessionScheduleDialogService);

  /** Opens schedule dialog with default form state (no slot); same close handling as calendar slot. */
  openScheduleFree(): void {
    this.subscribeScheduleClose(this.sessionScheduleDialogService.openDialog(""));
  }

  /** Opens shared schedule dialog with slot time pre-filled; client field stays empty (any client). */
  openForSlot(day: WeekDay, yInColumn: number): void {
    const startMs = snapToGrid(composeDayTime(day.date, yInColumn));
    this.subscribeScheduleClose(this.sessionScheduleDialogService.openDialog("", startMs));
  }

  private subscribeScheduleClose(dialogRef: ReturnType<SessionScheduleDialogService["openDialog"]>): void {
    if (!dialogRef) return;
    dialogRef.onClose
      .pipe(
        filter((result): result is SchedulePayload => this.isSchedulePayload(result)),
        take(1),
      )
      .subscribe((payload) => {
        this.applyPayloadToCalendarMock(payload);
      });
  }

  private applyPayloadToCalendarMock(payload: SchedulePayload): void {
    if (!payload.clientId || !payload.dateKey || !payload.startTime || !payload.endTime) return;
    const start = combineLocalDateKeyAndTime(payload.dateKey, payload.startTime);
    let end = combineLocalDateKeyAndTime(payload.dateKey, payload.endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;
    if (end.getTime() <= start.getTime()) {
      end = new Date(end.getTime() + 86_400_000);
    }
    const durationMin = Math.round((end.getTime() - start.getTime()) / 60_000);
    if (durationMin <= 0) return;

    // TODO: replace with API call to create empty session when backend is ready; keep calendar in sync from store refetch.
    this.calendarPageStore.addConsultationBlock(payload.clientId, start.getTime(), durationMin);
  }

  private isSchedulePayload(value: unknown): value is SchedulePayload {
    return (
      typeof value === "object" &&
      value !== null &&
      "clientId" in value &&
      "dateKey" in value &&
      "startTime" in value &&
      "endTime" in value
    );
  }
}
