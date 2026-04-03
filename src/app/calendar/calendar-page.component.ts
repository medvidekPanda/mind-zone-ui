import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { RouterLink } from "@angular/router";

import { ButtonModule } from "primeng/button";

import { PageHeaderComponent } from "../shared/components/page-header/page-header.component";
import { CalendarPageStore } from "../shared/store/calendar-page.store";
import { CalendarWeekGridComponent } from "./components/calendar-week-grid/calendar-week-grid.component";
import { CalendarAddDialogService } from "./service/calendar-add-dialog.service";

@Component({
  selector: "app-calendar-page",
  imports: [ButtonModule, CalendarWeekGridComponent, PageHeaderComponent, RouterLink],
  providers: [CalendarAddDialogService, CalendarPageStore],
  templateUrl: "./calendar-page.component.html",
  host: { class: "flex flex-1 flex-col min-h-0 w-full min-w-0" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPageComponent {
  private readonly addDialogService = inject(CalendarAddDialogService);

  private readonly calendarStore = inject(CalendarPageStore);

  protected readonly pageSubtitle = computed(() => `${this.calendarStore.weekTitle()} · mock data`);

  protected goToday(): void {
    this.calendarStore.goToday();
  }

  protected navigateWeek(deltaWeeks: number): void {
    this.calendarStore.navigateWeek(deltaWeeks);
  }

  protected openScheduleFree(): void {
    this.addDialogService.openScheduleFree();
  }
}
