import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";

import { DragDropModule } from "primeng/dragdrop";

import { CALENDAR_DND_SCOPE, CALENDAR_MIN_DAY_COLUMN_PX } from "../../../shared/constants/calendar.constants";
import type { WeekDay } from "../../../shared/interfaces/calendar.interface";
import { CalendarPageStore } from "../../../shared/store/calendar-page.store";
import { calendarGridHeightPx, calendarHoursRange, toDateKey } from "../../../shared/utils/calendar.utils";
import { CalendarAddDialogService } from "../../service/calendar-add-dialog.service";
import { CalendarEventBlockComponent } from "../calendar-event-block/calendar-event-block.component";

@Component({
  selector: "app-calendar-day-column",
  imports: [CalendarEventBlockComponent, DragDropModule],
  templateUrl: "./calendar-day-column.component.html",
  host: { class: "contents" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarDayColumnComponent {
  private readonly addDialogService = inject(CalendarAddDialogService);

  private readonly calendarStore = inject(CalendarPageStore);

  readonly day = input.required<WeekDay>();

  protected readonly blocksForDay = computed(() =>
    this.calendarStore.blocks().filter((block) => toDateKey(new Date(block.startMs)) === this.day().isoKey),
  );

  protected readonly calendarDndScope = CALENDAR_DND_SCOPE;

  protected readonly dayColumnMinPx = CALENDAR_MIN_DAY_COLUMN_PX;

  protected readonly gridHeightPx = calendarGridHeightPx();

  protected readonly hoursRange = calendarHoursRange;

  protected onColumnDrop(event: DragEvent): void {
    const column = event.currentTarget as HTMLElement;
    const rect = column.getBoundingClientRect();
    const y = event.clientY - rect.top;
    this.calendarStore.applyDrop(this.day(), y);
  }

  protected onColumnPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("app-calendar-event-block")) return;
    const column = event.currentTarget as HTMLElement;
    const rect = column.getBoundingClientRect();
    this.addDialogService.openForSlot(this.day(), event.clientY - rect.top);
  }
}
