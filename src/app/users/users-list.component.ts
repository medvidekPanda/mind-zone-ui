import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';

interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink, ButtonModule, TableModule, TagModule, TooltipModule],
  templateUrl: './users-list.component.html',
  host: { class: 'flex flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent {
  protected readonly users = signal<UserRow[]>([
    { id: '1', firstName: 'Anna', lastName: 'Nováková', role: 'terapeut' },
    { id: '2', firstName: 'Martin', lastName: 'Horák', role: 'terapeut' },
  ]);
}
