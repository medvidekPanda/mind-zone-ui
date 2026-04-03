import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "app-page-header",
  host: {
    class: "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6",
  },
  template: `
    <div>
      <h1 class="text-2xl font-bold text-slate-900 m-0">{{ title() }}</h1>
      @if (subtitle(); as subtitleText) {
        <p class="text-sm text-slate-500 m-0 mt-1">{{ subtitleText }}</p>
      }
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <ng-content select="[actions]" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  readonly subtitle = input<string | undefined>(undefined);

  readonly title = input.required<string>();
}
