import { Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

  menuOpen = false;
  showOwnerModal = false;
  becomingOwner = false;
  ownerError = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private host: ElementRef,
  ) {}

  get isLoggedIn(): boolean { return this.auth.isLoggedIn(); }
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

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu(): void { this.menuOpen = false; }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.menuOpen && !this.host.nativeElement.contains(event.target)) {
      this.menuOpen = false;
    }
  }

  login(): void { this.router.navigate(['/login']); }

  publish(): void {
    this.closeMenu();

    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.role === 'OWNER' || this.role === 'ADMIN') {
      this.router.navigate(['/owner/new-listing']);
      return;
    }

    // TENANT: open the elegant "become owner" modal
    this.ownerError = '';
    this.showOwnerModal = true;
  }

  cancelBecomeOwner(): void {
    if (this.becomingOwner) return;
    this.showOwnerModal = false;
  }

  confirmBecomeOwner(): void {
    this.becomingOwner = true;
    this.ownerError = '';

    this.auth.becomeOwner().subscribe({
      next: () => {
        this.auth.setRole('OWNER');
        this.becomingOwner = false;
        this.showOwnerModal = false;
        this.router.navigate(['/owner/new-listing']);
      },
      error: () => {
        this.becomingOwner = false;
        this.ownerError =
          'Impossible de passer en propriétaire pour le moment. Réessaie plus tard.';
      },
    });
  }

  logout(): void {
    this.closeMenu();
    localStorage.clear();
    this.router.navigate(['/app/listings']);
  }
}
