import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { ListingService } from '../../../core/services/listing.service';
import { AuthService } from '../../../core/services/auth.service';
import { ListingResponse } from '../../../core/models/listing.model';

@Component({
  selector: 'app-my-ads',
  imports: [RouterLink],
  templateUrl: './my-ads.html',
  styleUrl: './my-ads.css',
})
export class MyAds implements OnInit {
  ads = signal<ListingResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private listingService: ListingService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const ownerId = this.authService.getUserId();
    if (ownerId === null) {
      this.error.set('Impossible de récupérer votre identifiant. Reconnecte-toi.');
      return;
    }
    this.loading.set(true);
    this.listingService.getMyListings(ownerId).subscribe({
      next: (data) => { this.ads.set(data); this.loading.set(false); },
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
