import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {

  constructor(private auth: AuthService) {}

  get fullName(): string { return this.auth.getFullName(); }
  get email(): string { return this.auth.getEmail(); }
  get initial(): string { return (this.fullName.trim()[0] || 'U').toUpperCase(); }
  get role(): string { return this.auth.getRole(); }

  get roleLabel(): string {
    switch (this.role) {
      case 'OWNER': return 'Propriétaire';
      case 'ADMIN': return 'Administrateur';
      default: return 'Locataire';
    }
  }
}
