import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink, ButtonModule, CardModule, TagModule, TooltipModule],
  templateUrl: './client-detail.component.html',
  host: { class: 'flex flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailComponent {
  readonly id = input.required<string>();
  protected readonly client = signal({
    firstName: 'Jan',
    lastName: 'Novák',
    gender: 'muž',
    birthDate: '1990-05-15',
    email: 'jan@example.com',
    status: 'active',
  });

  protected deleteClient(): void {
    // Placeholder – bez API
  }
}
