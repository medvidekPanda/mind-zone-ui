import { ChangeDetectionStrategy, Component, inject } from "@angular/core";

import { CALENDAR_MIN_DAY_COLUMN_PX, CALENDAR_TIME_GUTTER_PX } from "../../../shared/constants/calendar.constants";
import { CalendarPageStore } from "../../../shared/store/calendar-page.store";
import { calendarGridHeightPx, calendarHoursRange } from "../../../shared/utils/calendar.utils";
import { CalendarDayColumnComponent } from "../calendar-day-column/calendar-day-column.component";

@Component({
  selector: "app-calendar-week-grid",
  imports: [CalendarDayColumnComponent],
  templateUrl: "./calendar-week-grid.component.html",
  host: {
    class:
      "flex flex-1 flex-col min-h-0 min-w-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-900",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarWeekGridComponent {
  private readonly calendarStore = inject(CalendarPageStore);

  protected readonly dayColumnMinPx = CALENDAR_MIN_DAY_COLUMN_PX;

  protected readonly gridHeightPx = calendarGridHeightPx();

  protected readonly hoursRange = calendarHoursRange;

  protected readonly weekDays = this.calendarStore.weekDays;

  protected readonly weekGridMinBlockWidth = `max(100%, ${CALENDAR_TIME_GUTTER_PX + 7 * CALENDAR_MIN_DAY_COLUMN_PX}px)`;
}
