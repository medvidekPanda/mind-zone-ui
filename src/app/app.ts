import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { BadgeModule } from 'primeng/badge';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    DrawerModule,
    ButtonModule,
    RippleModule,
    BadgeModule,
    NgTemplateOutlet,
  ],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly sidebarVisible = signal(false);

  protected toggleSidebar(): void {
    this.sidebarVisible.update((v) => !v);
  }

  protected closeSidebarOnNav(): void {
    this.sidebarVisible.set(false);
  }
}
