import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { RouterLink } from "@angular/router";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { ChartModule } from "primeng/chart";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: "app-dashboard",
  imports: [RouterLink, ButtonModule, CardModule, ChartModule, TagModule, TooltipModule],
  templateUrl: "./dashboard.component.html",
  host: { class: "flex flex-col" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  protected readonly paidCount = signal(12);
  protected readonly unpaidCount = signal(3);
  protected readonly pieData = signal({
    labels: ["Aktivní klienti", "Neaktivní"],
    datasets: [
      {
        data: [24, 8],
        backgroundColor: ["#22c55e", "#e2e8f0"],
        hoverBackgroundColor: ["#16a34a", "#cbd5e1"],
      },
    ],
  });
  protected readonly pieOptions = signal({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
  });
  protected readonly todaySessions = signal([
    { id: "1", time: "09:00", clientName: "Jan Novák", clientId: "c1" },
    { id: "2", time: "14:00", clientName: "Marie Svobodová", clientId: "c2" },
  ]);
  protected readonly tomorrowSessions = signal([{ id: "3", time: "10:00", clientName: "Petr Dvořák", clientId: "c3" }]);
}
