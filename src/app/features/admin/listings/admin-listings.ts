import { Component, OnInit, computed, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ListingService } from '../../../core/services/listing.service';
import { PropertyService } from '../../../core/services/property.service';
import { ListingResponse } from '../../../core/models/listing.model';
import { PropertyResponse } from '../../../core/models/property.model';

interface ReviewRow {
  listing: ListingResponse;
  property: PropertyResponse | null;
}

@Component({
  selector: 'app-admin-listings',
  imports: [],
  templateUrl: './admin-listings.html',
  styleUrl: './admin-listings.css',
})
export class AdminListings implements OnInit {
  rows = signal<ReviewRow[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  preview = signal<ReviewRow | null>(null);
  activeImage = signal(0);

  queueCount = computed(() => this.rows().length);

  constructor(
    private listingService: ListingService,
    private propertyService: PropertyService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.listingService.getPendingListings(0, 50).subscribe({
      next: (page) => {
        const listings = page.content;
        if (!listings.length) {
          this.rows.set([]);
          this.loading.set(false);
          return;
        }

        forkJoin(
          listings.map((listing) =>
            this.propertyService
              .getPropertyById(listing.propertyId)
              .pipe(catchError(() => of(null))),
          ),
        ).subscribe((props) => {
          this.rows.set(listings.map((listing, i) => ({ listing, property: props[i] })));
          this.loading.set(false);
        });
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

  cover(row: ReviewRow): string | null {
    return row.property?.images?.[0] ?? null;
  }

  images(row: ReviewRow): string[] {
    return row.property?.images ?? [];
  }

  timeAgo(iso: string | null): string {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diff / 3_600_000);
    if (hours < 1) return "il y a moins d'1 h";
    if (hours < 24) return `il y a ${hours} h`;
    return `il y a ${Math.floor(hours / 24)} j`;
  }

  photoCount(row: ReviewRow): number {
    return this.images(row).length;
  }

  descShort(row: ReviewRow): boolean {
    return (row.listing.description || '').trim().length < 60;
  }

  openPreview(row: ReviewRow): void {
    this.activeImage.set(0);
    this.preview.set(row);
  }

  closePreview(): void {
    this.preview.set(null);
  }

  approve(row: ReviewRow): void {
    this.listingService.approveListing(row.listing.id).subscribe({
      next: () => {
        this.remove(row.listing.id);
        this.closePreview();
      },
      error: () => this.error.set('Échec de l’approbation.'),
    });
  }

  reject(row: ReviewRow): void {
    this.listingService.rejectListing(row.listing.id).subscribe({
      next: () => {
        this.remove(row.listing.id);
        this.closePreview();
      },
      error: () => this.error.set('Échec du rejet.'),
    });
  }

  approveAll(): void {
    const rows = this.rows();
    if (!rows.length) return;

    forkJoin(
      rows.map((r) =>
        this.listingService.approveListing(r.listing.id).pipe(catchError(() => of(null))),
      ),
    ).subscribe(() => this.load());
  }

  private remove(id: number): void {
    this.rows.update((list) => list.filter((r) => r.listing.id !== id));
  }
}
