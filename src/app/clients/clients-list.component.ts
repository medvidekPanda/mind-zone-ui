import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';

interface ClientRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [
    PageHeaderComponent,
    RouterLink,
    FormsModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    SelectModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './clients-list.component.html',
  host: { class: 'flex flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsListComponent {
  protected readonly searchText = signal('');
  protected readonly statusFilter = signal<string | null>(null);
  protected readonly statusOptions = signal([
    { label: 'Všechny', value: null },
    { label: 'Aktivní', value: 'active' },
    { label: 'Neaktivní', value: 'inactive' },
  ]);
  protected readonly clients = signal<ClientRow[]>([
    { id: 'c1', firstName: 'Jan', lastName: 'Novák', email: 'jan@example.com', status: 'active' },
    {
      id: 'c2',
      firstName: 'Marie',
      lastName: 'Svobodová',
      email: 'marie@example.com',
      status: 'active',
    },
    {
      id: 'c3',
      firstName: 'Petr',
      lastName: 'Dvořák',
      email: 'petr@example.com',
      status: 'inactive',
    },
  ]);

  protected deleteClient(_id: string): void {
    // Placeholder – bez API
  }
}
