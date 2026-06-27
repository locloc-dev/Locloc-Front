import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

  constructor(
    private router: Router,
    private auth: AuthService,
  ) {}

  get fullName(): string {
    return this.auth.getFullName();
  }

  get initial(): string {
    return (this.fullName.trim()[0] || 'U').toUpperCase();
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
