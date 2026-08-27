import { Component, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { switchMap } from 'rxjs';

import { PropertyService } from '../../../core/services/property.service';
import { ListingService } from '../../../core/services/listing.service';
import { AuthService } from '../../../core/services/auth.service';
import {PROPERTY_TYPES, PropertyRequest} from '../../../core/models/property.model';
import { ListingRequest, ListingType } from '../../../core/models/listing.model';

@Component({
  selector: 'app-new-listing',
  imports: [ReactiveFormsModule],
  templateUrl: './new-listing.html',
  styleUrl: './new-listing.css',
})
export class NewListing {
  form: FormGroup;
  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  propertyTypes = PROPERTY_TYPES;

  vm;
  firstImage;

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService,
    private listingService: ListingService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
      type: ['RENT', [Validators.required]],
      price: [null, [Validators.required, Validators.min(1)]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      propertyType: ['APARTMENT', [Validators.required]],
      bedrooms: [null],
      bathrooms: [null],
      surface: [null],
      images: [''],
    });

    this.vm = toSignal(this.form.valueChanges, {
      initialValue: this.form.getRawValue(),
    });
    this.firstImage = computed(() => this.parseImages(this.vm().images)[0] ?? null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const ownerId = this.authService.getUserId();
    if (ownerId === null) {
      this.error.set('Impossible de récupérer votre identifiant. Reconnecte-toi.');
      return;
    }

    const raw = this.form.getRawValue();

    const property: PropertyRequest = {
      description: raw.description.trim(),
      address: raw.address.trim(),
      city: raw.city.trim(),
      propertyType: raw.propertyType,
      images: this.parseImages(raw.images),
    };

    this.submitting.set(true);
    this.error.set(null);

    this.propertyService
      .createProperty(property, ownerId)
      .pipe(
        switchMap((createdProperty) => {
          const listing: ListingRequest = {
            propertyId: createdProperty.id,
            title: raw.title.trim(),
            description: raw.description.trim(),
            price: Number(raw.price),
            type: raw.type as ListingType,
          };
          return this.listingService.createListing(listing, ownerId);
        }),
        switchMap((createdListing) =>
          this.listingService.submitListing(createdListing.id, ownerId),
        ),
      )
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.success.set(true);
          setTimeout(() => this.router.navigate(['/owner/ads']), 1300);
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          this.error.set(
            err?.status === 403
              ? 'Accès refusé : connecte-toi avec un compte OWNER.'
              : 'Échec de la publication. Vérifie que le backend tourne sur :8080.',
          );
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/owner/listings']);
  }

  private parseImages(value: string): string[] {
    if (!value) {
      return [];
    }
    return value
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }
}
