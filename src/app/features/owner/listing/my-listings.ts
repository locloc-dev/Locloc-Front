import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { PropertyService } from '../../../core/services/property.service';
import { AuthService } from '../../../core/services/auth.service';
import { PropertyResponse } from '../../../core/models/property.model';

@Component({
  selector: 'app-my-listing',
  imports: [RouterLink],
  templateUrl: './my-listings.html',
  styleUrl: './my-listings.css',
})
export class MyListings implements OnInit {
  listings = signal<PropertyResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  liveCount = computed(() => this.listings().filter((p) => p.status === 'APPROVED').length);
  pendingCount = computed(() => this.listings().filter((p) => p.status === 'PENDING').length);
  rejectedCount = computed(() => this.listings().filter((p) => p.status === 'REJECTED').length);

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const ownerId = this.authService.getUserId();
    if (ownerId === null) {
      this.error.set('Impossible de récupérer votre identifiant. Reconnecte-toi.');
      return;
    }

    this.loading.set(true);
    this.propertyService.getMyProperties(ownerId).subscribe({
      next: (data) => {
        this.listings.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(
          err?.status === 403
            ? 'Accès refusé : connecte-toi avec un compte OWNER.'
            : 'Impossible de charger vos annonces. Backend démarré sur :8080 ?',
        );
        this.loading.set(false);
      },
    });
  }
}
