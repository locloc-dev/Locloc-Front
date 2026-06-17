import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { switchMap } from 'rxjs';

import { ListingService } from '../../../core/services/listing.service';
import { PropertyService } from '../../../core/services/property.service';
import { AuthService } from '../../../core/services/auth.service';
import { ListingRequest } from '../../../core/models/listing.model';
import { PropertyResponse } from '../../../core/models/property.model';

@Component({
  selector: 'app-new-listing-ad',
  imports: [ReactiveFormsModule],
  templateUrl: './new-listing-ad.html',
  styleUrl: './new-listing-ad.css',
})
export class NewListingAd implements OnInit {
  form: FormGroup;
  approvedProperties = signal<PropertyResponse[]>([]);
  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  constructor(
    private fb: FormBuilder,
    private listingService: ListingService,
    private propertyService: PropertyService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      propertyId: [null, [Validators.required]],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      price: [null, [Validators.required, Validators.min(1)]],
      type: ['RENT', [Validators.required]],
    });
  }

  ngOnInit(): void {
    const ownerId = this.authService.getUserId();
    if (ownerId === null) {
      this.error.set('Impossible de récupérer votre identifiant. Reconnecte-toi.');
      return;
    }
    this.propertyService.getMyProperties(ownerId).subscribe({
      next: (list) =>
        this.approvedProperties.set(list.filter((p) => p.status === 'APPROVED')),
      error: () => this.error.set('Impossible de charger vos propriétés.'),
    });
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
    const raw = this.form.value;
    const request: ListingRequest = {
      propertyId: Number(raw.propertyId),
      title: raw.title.trim(),
      description: (raw.description || '').trim(),
      price: Number(raw.price),
      type: raw.type,
    };
    this.submitting.set(true);
    this.error.set(null);

    this.listingService
      .createListing(request, ownerId)
      .pipe(switchMap((created) => this.listingService.submitListing(created.id, ownerId)))
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
    this.router.navigate(['/owner/ads']);
  }
}
