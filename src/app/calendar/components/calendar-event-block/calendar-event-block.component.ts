import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";

import { DragDropModule } from "primeng/dragdrop";

import { CALENDAR_DND_SCOPE } from "../../../shared/constants/calendar.constants";
import type { CalendarBlock, WeekDay } from "../../../shared/interfaces/calendar.interface";
import { CalendarPageStore } from "../../../shared/store/calendar-page.store";
import { calendarEventHeight, calendarEventTopMillis } from "../../../shared/utils/calendar.utils";

@Component({
  selector: "app-calendar-event-block",
  imports: [DragDropModule, RouterLink],
  templateUrl: "./calendar-event-block.component.html",
  host: { class: "contents" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarEventBlockComponent {
  private readonly calendarStore = inject(CalendarPageStore);

  readonly block = input.required<CalendarBlock>();

  readonly day = input.required<WeekDay>();

  protected readonly clientLabel = computed(() => this.calendarStore.resolveClientLabel(this.block().clientId));

  protected readonly dndScope = CALENDAR_DND_SCOPE;

  protected readonly eventHeightPx = computed(() => calendarEventHeight(this.block()));
  protected readonly eventTopPx = computed(() => calendarEventTopMillis(this.block().startMs));

  protected readonly isBeingDragged = computed(() => this.calendarStore.draggedBlock()?.id === this.block().id);

  protected readonly timeRangeLabel = computed(() => {
    const consultationBlock = this.block();
    const formatter = new Intl.DateTimeFormat("cs-CZ", { hour: "2-digit", minute: "2-digit" });
    return `${formatter.format(new Date(consultationBlock.startMs))}–${formatter.format(new Date(consultationBlock.endMs))}`;
  });

  protected onBlockDrop(event: DragEvent): void {
    const column = (event.currentTarget as HTMLElement).closest(".calendar-day-drop");
    if (!column) return;
    const rect = column.getBoundingClientRect();
    const y = event.clientY - rect.top;
    this.calendarStore.applyDrop(this.day(), y);
  }

  protected onDragEnd(): void {
    this.calendarStore.clearDraggedBlock();
  }

  protected onDragStart(dragEvent: DragEvent): void {
    const blockEl = dragEvent.currentTarget as HTMLElement;
    const rect = blockEl.getBoundingClientRect();
    const grabOffsetYPx = dragEvent.clientY - rect.top;
    this.calendarStore.startDragging(this.block(), grabOffsetYPx);
  }
}
