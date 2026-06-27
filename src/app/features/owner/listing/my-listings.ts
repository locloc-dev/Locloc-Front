import { Component, OnInit, signal } from '@angular/core';
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
  properties = signal<PropertyResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

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
        this.properties.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(
          err?.status === 403
            ? 'Accès refusé : connecte-toi avec un compte OWNER.'
            : 'Impossible de charger vos biens. Backend démarré sur :8080 ?',
        );
        this.loading.set(false);
      },
    });
  }
}
