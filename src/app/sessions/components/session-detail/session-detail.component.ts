import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-session-detail',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink, ButtonModule, CardModule, ChipModule, TagModule, DividerModule],
  templateUrl: './session-detail.component.html',
  host: { class: 'flex flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionDetailComponent {
  readonly id = input.required<string>();
  protected readonly session = signal({
    date: '2025-02-26',
    time: '09:00',
    form: 'online',
    type: 'individuální',
    duration: 60,
    price: 800,
    paid: true,
    tags: ['deprese', 'úzkost'],
    notes: 'Poznámky k sezení…',
    attachments: [] as string[],
    nextSession: '2025-03-05 10:00',
  });

  protected addAttachment(): void {
    // Placeholder
  }
}
