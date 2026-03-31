import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";

import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-list-reload-button",
  imports: [ButtonModule],
  template: `
    <button
      type="button"
      pButton
      [label]="label()"
      icon="pi pi-refresh"
      severity="secondary"
      outlined
      (click)="reload.emit()"
    ></button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListReloadButtonComponent {
  readonly label = input<string>("Obnovit");

  readonly reload = output<void>();
}
