import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';

import { ListingService } from '../../core/services/listing.service';
import { PropertyService } from '../../core/services/property.service';
import { ListingResponse } from '../../core/models/listing.model';
import { PropertyResponse } from '../../core/models/property.model';

/** A listing enriched with its property (for city + image) */
interface ListingCard {
  listing: ListingResponse;
  property: PropertyResponse | null;
}

@Component({
  selector: 'app-listings',
  imports: [RouterLink],
  templateUrl: './listings.html',
  styleUrl: './listings.css',
})
export class Listings implements OnInit {
  all = signal<ListingCard[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  search = signal('');

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) {
      return this.all();
    }
    return this.all().filter(
      (c) =>
        c.listing.title.toLowerCase().includes(q) ||
        (c.property?.city ?? '').toLowerCase().includes(q) ||
        (c.listing.description ?? '').toLowerCase().includes(q),
    );
  });

  constructor(
    private listingService: ListingService,
    private propertyService: PropertyService,
  ) {}

  ngOnInit(): void {
    this.loading.set(true);

    this.listingService.searchListings().subscribe({
      next: (page) => {
        const listings = page.content;
        if (!listings.length) {
          this.all.set([]);
          this.loading.set(false);
          return;
        }

        // Enrich each listing with its property (city + image)
        forkJoin(
          listings.map((listing) =>
            forkJoin({
              listing: of(listing),
              property: this.propertyService.getPropertyById(listing.propertyId),
            }),
          ),
        ).subscribe({
          next: (cards) => {
            this.all.set(cards as ListingCard[]);
            this.loading.set(false);
          },
          // If a property fails to load, still show the listings without it
          error: () => {
            this.all.set(listings.map((l) => ({ listing: l, property: null })));
            this.loading.set(false);
          },
        });
      },
      error: (_err: HttpErrorResponse) => {
        this.error.set('Impossible de charger les annonces. Backend démarré sur :8080 ?');
        this.loading.set(false);
      },
    });
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }
}
