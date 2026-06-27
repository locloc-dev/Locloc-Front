import {Component, signal} from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive} from '@angular/router';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
@Component({
  selector: 'app-admin-layout',
  standalone: true,

  imports: [RouterOutlet, RouterLink, RouterLinkActive],

  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  sidebarOpen = signal(false);

  constructor(
    private router: Router,
    private auth: AuthService,
  ) {}

  get fullName(): string {
    return this.auth.getFullName();
  }

  get initial(): string {
    return (this.fullName.trim()[0] || 'A').toUpperCase();
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
