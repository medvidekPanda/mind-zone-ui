import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink, ButtonModule, CardModule, TagModule],
  templateUrl: './user-detail.component.html',
  host: { class: 'flex flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent {
  readonly id = input.required<string>();
  protected readonly user = signal({
    firstName: 'Anna',
    lastName: 'Nováková',
    firebaseId: 'firebase-id-xxx',
    role: 'terapeut',
  });
}
