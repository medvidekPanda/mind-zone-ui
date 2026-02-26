import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-sessions-calendar',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink, ButtonModule, CardModule],
  templateUrl: './sessions-calendar.component.html',
  host: { class: 'flex flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsCalendarComponent {
  protected readonly currentMonth = signal('Únor 2025');
  protected readonly events = signal([
    { id: '1', date: '2025-02-26', time: '09:00', title: 'Jan Novák', clientId: 'c1' },
    { id: '2', date: '2025-02-26', time: '14:00', title: 'Marie Svobodová', clientId: 'c2' },
    { id: '3', date: '2025-02-27', time: '10:00', title: 'Petr Dvořák', clientId: 'c3' },
  ]);
}
