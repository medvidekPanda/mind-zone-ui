import { ChangeDetectionStrategy, Component, model, signal } from "@angular/core";
import { RouterLink } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";

import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import {
  ScheduleFormData,
  SessionScheduleDialogComponent,
} from "../session-schedule-dialog/session-schedule-dialog.component";

@Component({
  selector: "app-sessions-calendar",
  standalone: true,
  imports: [PageHeaderComponent, RouterLink, ButtonModule, CardModule, SessionScheduleDialogComponent],
  templateUrl: "./sessions-calendar.component.html",
  host: { class: "flex flex-col" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsCalendarComponent {
  protected readonly currentMonth = signal("Únor 2025");
  protected readonly events = signal([
    { id: "1", date: "2025-02-26", time: "09:00", title: "Jan Novák", clientId: "c1" },
    { id: "2", date: "2025-02-26", time: "14:00", title: "Marie Svobodová", clientId: "c2" },
    { id: "3", date: "2025-02-27", time: "10:00", title: "Petr Dvořák", clientId: "c3" },
  ]);

  protected readonly scheduleDialogVisible = model(false);

  protected readonly clientOptions = [
    { label: "Jan Novák", value: "c1" },
    { label: "Marie Svobodová", value: "c2" },
    { label: "Petr Dvořák", value: "c3" },
  ];

  protected readonly therapistOptions = [{ label: "Anna Nováková", value: "t1" }];

  protected readonly durationOptions = [
    { label: "45 min", value: 45 },
    { label: "60 min", value: 60 },
    { label: "90 min", value: 90 },
    { label: "120 min", value: 120 },
  ];

  protected readonly formOptions = [
    { label: "Online", value: "online" },
    { label: "Osobně", value: "in_person" },
  ];

  protected readonly typeOptions = [
    { label: "Individuální", value: "individual" },
    { label: "Párová", value: "couple" },
    { label: "Skupinová", value: "group" },
  ];

  protected openScheduleDialog(): void {
    this.scheduleDialogVisible.set(true);
  }

  protected saveSchedule(_data: ScheduleFormData): void {
    // Placeholder – bez API
  }
}
