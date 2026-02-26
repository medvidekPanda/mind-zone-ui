import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    PageHeaderComponent,
    RouterLink,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: './client-form.component.html',
  host: { class: 'flex flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientFormComponent {
  readonly id = input<string | undefined>(undefined);
  protected readonly isEdit = () => !!this.id();
  protected firstName = '';
  protected lastName = '';
  protected gender: string | null = null;
  protected birthDate = '';
  protected email = '';
  protected status: string | null = null;
  protected readonly genderOptions = [
    { label: 'Muž', value: 'male' },
    { label: 'Žena', value: 'female' },
    { label: 'Jiné', value: 'other' },
  ];
  protected readonly statusOptions = [
    { label: 'Aktivní', value: 'active' },
    { label: 'Neaktivní', value: 'inactive' },
  ];

  protected save(): void {
    // Placeholder – bez API
  }
}
