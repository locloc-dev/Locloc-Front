import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';

import { ListingService } from '../../core/services/listing.service';
import { PropertyService } from '../../core/services/property.service';
import { ListingResponse } from '../../core/models/listing.model';
import {PROPERTY_TYPES, PropertyResponse, PropertyType} from '../../core/models/property.model';

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
  typeFilter = signal<'ALL' | 'RENT' | 'SALE'>('ALL');
  propertyTypeFilter = signal<'ALL' | PropertyType>('ALL');

  propertyTypes = PROPERTY_TYPES;


  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const type = this.typeFilter();
    const pType = this.propertyTypeFilter();

    return this.all().filter((c) => {
      if (type !== 'ALL' && c.listing.type !== type) {
        return false;
      }

      if (pType !== 'ALL' && c.property?.propertyType !== pType) {
        return false;
      }

      if (q) {
        return (
          c.listing.title.toLowerCase().includes(q) ||
          (c.property?.city ?? '').toLowerCase().includes(q) ||
          (c.listing.description ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  });

  setType(type: 'ALL' | 'RENT' | 'SALE'): void {
    this.typeFilter.set(type);
  }

  onPropertyType(event: Event): void {
    this.propertyTypeFilter.set(
      (event.target as HTMLSelectElement).value as 'ALL' | PropertyType,
    );
  }

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
