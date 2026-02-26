import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-session-schedule',
  standalone: true,
  imports: [
    PageHeaderComponent,
    RouterLink,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    SelectModule,
    InputNumberModule,
    CheckboxModule,
    MultiSelectModule,
  ],
  templateUrl: './session-schedule.component.html',
  host: { class: 'flex flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionScheduleComponent {
  protected dateTime = '';
  protected form: string | null = null;
  protected type: string | null = null;
  protected duration: number | null = 60;
  protected price: number | null = null;
  protected paid = false;
  protected tags: string[] = [];
  protected notes = '';
  protected nextSession = '';
  protected readonly formOptions = [
    { label: 'Online', value: 'online' },
    { label: 'Osobně', value: 'in_person' },
  ];
  protected readonly typeOptions = [
    { label: 'Individuální', value: 'individual' },
    { label: 'Párová', value: 'couple' },
    { label: 'Skupinová', value: 'group' },
  ];
  protected readonly tagOptions = [
    { label: 'Deprese', value: 'deprese' },
    { label: 'Úzkost', value: 'úzkost' },
    { label: 'Vztahy', value: 'vztahy' },
  ];
  protected readonly therapistOptions = [
    { label: 'Anna Nováková', value: '1' },
  ];
  protected readonly clientOptions = [
    { label: 'Jan Novák', value: 'c1' },
    { label: 'Marie Svobodová', value: 'c2' },
  ];
  protected therapist: string | null = null;
  protected client: string | null = null;

  protected save(): void {
    // Placeholder – bez API
  }
}
