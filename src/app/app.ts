import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import type { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MenubarModule, ButtonModule, BadgeModule],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-th-large', routerLink: '/dashboard', routerLinkActiveOptions: { exact: true } },
    { label: 'Terapeuti', icon: 'pi pi-users', routerLink: '/users' },
    { label: 'Klienti', icon: 'pi pi-id-card', routerLink: '/clients' },
    {
      label: 'Sezení',
      icon: 'pi pi-calendar',
      items: [
        { label: 'Seznam sezení', icon: 'pi pi-list', routerLink: '/sessions' },
        { label: 'Kalendář', icon: 'pi pi-calendar-plus', routerLink: '/sessions/calendar' },
      ],
    },
  ];
}
