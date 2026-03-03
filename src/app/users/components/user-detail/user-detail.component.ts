import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    PageHeaderComponent,
    RouterLink,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    TagModule,
  ],
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
  protected readonly editing = signal(false);

  protected readonly editFirebaseId = signal('');
  protected readonly editFirstName = signal('');
  protected readonly editLastName = signal('');

  protected startEdit(): void {
    const u = this.user();
    this.editFirebaseId.set(u.firebaseId);
    this.editFirstName.set(u.firstName);
    this.editLastName.set(u.lastName);
    this.editing.set(true);
  }

  protected cancelEdit(): void {
    this.editing.set(false);
  }

  protected saveEdit(): void {
    this.user.update((u) => ({
      ...u,
      firebaseId: this.editFirebaseId(),
      firstName: this.editFirstName(),
      lastName: this.editLastName(),
    }));
    this.editing.set(false);
  }
}
