import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-owner-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './owner-layout.html',
  styleUrl: './owner-layout.css',
})
export class OwnerLayout {
  constructor(
    private router: Router,
    private auth: AuthService,
  ) {}

  get fullName(): string {
    return this.auth.getFullName();
  }

  get role(): string {
    return this.auth.getRole();
  }

  get initial(): string {
    return (this.fullName.trim()[0] || 'U').toUpperCase();
  }

  roleLabel(): string {
    switch (this.role) {
      case 'OWNER': return 'Propriétaire';
      case 'ADMIN': return 'Administrateur';
      case 'TENANT': return 'Locataire';
      default: return '';
    }
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
