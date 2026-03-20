import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "app-page-header",
  template: `
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <h1 class="text-2xl font-bold text-slate-900 m-0">{{ title() }}</h1>
      <div class="flex flex-wrap items-center gap-2">
        <ng-content select="[actions]" />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
}
