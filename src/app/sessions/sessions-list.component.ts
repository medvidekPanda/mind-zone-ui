import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';

interface SessionRow {
  id: string;
  date: string;
  time: string;
  therapistName: string;
  clientName: string;
  duration: number;
  form: string;
  paid: boolean;
}

@Component({
  selector: 'app-sessions-list',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink, ButtonModule, TableModule, TagModule, TooltipModule],
  templateUrl: './sessions-list.component.html',
  host: { class: 'flex flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsListComponent {
  protected readonly sessions = signal<SessionRow[]>([
    {
      id: '1',
      date: '2025-02-26',
      time: '09:00',
      therapistName: 'Anna Nováková',
      clientName: 'Jan Novák',
      duration: 60,
      form: 'osobně',
      paid: true,
    },
    {
      id: '2',
      date: '2025-02-26',
      time: '14:00',
      therapistName: 'Anna Nováková',
      clientName: 'Marie Svobodová',
      duration: 45,
      form: 'online',
      paid: false,
    },
  ]);
}
