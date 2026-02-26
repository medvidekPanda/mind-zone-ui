import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-user-clients',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink, ButtonModule, TableModule],
  templateUrl: './user-clients.component.html',
  host: { class: 'flex flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserClientsComponent {
  readonly id = input.required<string>();
  protected readonly clients = signal([
    { id: 'c1', firstName: 'Jan', lastName: 'Novák' },
    { id: 'c2', firstName: 'Marie', lastName: 'Svobodová' },
  ]);
}
