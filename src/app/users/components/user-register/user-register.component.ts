import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink, FormsModule, ButtonModule, CardModule, InputTextModule],
  templateUrl: './user-register.component.html',
  host: { class: 'flex flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserRegisterComponent {
  protected firebaseId = '';
  protected firstName = '';
  protected lastName = '';

  protected save(): void {
    // Placeholder – no API
  }
}
