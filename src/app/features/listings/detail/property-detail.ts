import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { switchMap } from 'rxjs';

import { ListingService } from '../../../core/services/listing.service';
import { PropertyService } from '../../../core/services/property.service';
import { RequestService } from '../../../core/services/request.service';
import { ListingResponse } from '../../../core/models/listing.model';
import { PropertyResponse } from '../../../core/models/property.model';
import { RequestCreateDTO, RequestType } from '../../../core/models/request.model';

@Component({
  selector: 'app-property-detail',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.css',
})
export class PropertyDetail implements OnInit {
  listing = signal<ListingResponse | null>(null);
  property = signal<PropertyResponse | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  activeImage = signal(0);

  form: FormGroup;
  sending = signal(false);
  requestSent = signal(false);
  requestError = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private listingService: ListingService,
    private propertyService: PropertyService,
    private requestService: RequestService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      type: ['RENT', [Validators.required]],
      message: [''],
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('Annonce introuvable.');
      return;
    }

    this.loading.set(true);
    this.listingService
      .getListingById(id)
      .pipe(
        switchMap((listing) => {
          this.listing.set(listing);
          return this.propertyService.getPropertyById(listing.propertyId);
        }),
      )
      .subscribe({
        next: (property) => {
          this.property.set(property);
          this.loading.set(false);
        },
        error: (_err: HttpErrorResponse) => {
          this.loading.set(false);
          if (!this.listing()) {
            this.error.set('Impossible de charger cette annonce.');
          }
        },
      });
  }

  setImage(i: number): void {
    this.activeImage.set(i);
  }

  sendRequest(): void {
    const listing = this.listing();
    if (!listing || this.form.invalid) return;

    const dto: RequestCreateDTO = {
      listingId: listing.id,
      type: this.form.value.type as RequestType,
      message: (this.form.value.message || '').trim(),
    };

    this.sending.set(true);
    this.requestError.set(null);

    this.requestService.createRequest(dto).subscribe({
      next: () => {
        this.sending.set(false);
        this.requestSent.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.sending.set(false);
        this.requestError.set(
          err?.status === 403
            ? 'Accès refusé : connecte-toi en TENANT (et le backend doit autoriser TENANT).'
            : 'Échec de l’envoi de la demande.',
        );
      },
    });
  }
}
