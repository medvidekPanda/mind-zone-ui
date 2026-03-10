import { ChangeDetectionStrategy, Component } from "@angular/core";

import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-session-attachments",
  standalone: true,
  imports: [ButtonModule],
  templateUrl: "./session-attachments.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionAttachmentsComponent {}
