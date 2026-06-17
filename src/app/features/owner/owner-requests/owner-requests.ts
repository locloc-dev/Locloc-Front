import { Component, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';

import { ListingService } from '../../../core/services/listing.service';
import { RequestService } from '../../../core/services/request.service';
import { AuthService } from '../../../core/services/auth.service';
import { ListingResponse } from '../../../core/models/listing.model';
import { RequestResponse } from '../../../core/models/request.model';

/** A received request with the listing it targets */
interface ReceivedRequest {
  listing: ListingResponse;
  request: RequestResponse;
}

@Component({
  selector: 'app-owner-requests',
  imports: [],
  templateUrl: './owner-requests.html',
  styleUrl: './owner-requests.css',
})
export class OwnerRequests implements OnInit {
  rows = signal<ReceivedRequest[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private listingService: ListingService,
    private requestService: RequestService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const ownerId = this.authService.getUserId();
    if (ownerId === null) {
      this.error.set('Impossible de récupérer votre identifiant. Reconnecte-toi.');
      return;
    }

    this.loading.set(true);

    // 1) my listings -> 2) the requests received on each listing
    this.listingService.getMyListings(ownerId).subscribe({
      next: (listings) => {
        if (!listings.length) {
          this.rows.set([]);
          this.loading.set(false);
          return;
        }

        forkJoin(
          listings.map((listing) =>
            forkJoin({
              listing: of(listing),
              page: this.requestService.getListingRequests(listing.id),
            }),
          ),
        ).subscribe({
          next: (results) => {
            const rows: ReceivedRequest[] = [];
            for (const r of results) {
              for (const request of r.page.content) {
                rows.push({ listing: r.listing, request });
              }
            }
            this.rows.set(rows);
            this.loading.set(false);
          },
          error: () => {
            this.error.set('Impossible de charger les demandes.');
            this.loading.set(false);
          },
        });
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

  accept(row: ReceivedRequest): void {
    this.requestService.acceptRequest(row.request.id).subscribe({
      next: (updated) => this.updateRow(row.request.id, updated),
      error: () => this.error.set('Échec de l’acceptation.'),
    });
  }

  reject(row: ReceivedRequest): void {
    this.requestService.rejectRequest(row.request.id).subscribe({
      next: (updated) => this.updateRow(row.request.id, updated),
      error: () => this.error.set('Échec du rejet.'),
    });
  }

  typeLabel(type: string): string {
    return type === 'VISIT' ? 'Visite' : type === 'RENT' ? 'Location' : 'Achat';
  }

  private updateRow(id: number, updated: RequestResponse): void {
    this.rows.update((list) =>
      list.map((r) => (r.request.id === id ? { ...r, request: updated } : r)),
    );
  }
}
