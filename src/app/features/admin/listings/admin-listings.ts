import { Component, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { ListingService } from '../../../core/services/listing.service';
import { ListingResponse } from '../../../core/models/listing.model';

@Component({
  selector: 'app-admin-listings',
  imports: [],
  templateUrl: './admin-listings.html',
  styleUrl: './admin-listings.css',
})
export class AdminListings implements OnInit {
  listings = signal<ListingResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private listingService: ListingService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.listingService.getPendingListings(0, 50).subscribe({
      next: (page) => {
        this.listings.set(page.content);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(
          err?.status === 403
            ? 'Accès refusé : connecte-toi avec un compte ADMIN.'
            : 'Impossible de charger les annonces. Backend démarré sur :8080 ?',
        );
        this.loading.set(false);
      },
    });
  }

  approve(listing: ListingResponse): void {
    this.listingService.approveListing(listing.id).subscribe({
      next: () => this.remove(listing.id),
      error: () => this.error.set('Échec de l’approbation.'),
    });
  }

  reject(listing: ListingResponse): void {
    this.listingService.rejectListing(listing.id).subscribe({
      next: () => this.remove(listing.id),
      error: () => this.error.set('Échec du rejet.'),
    });
  }

  private remove(id: number): void {
    this.listings.update((list) => list.filter((l) => l.id !== id));
  }
}
