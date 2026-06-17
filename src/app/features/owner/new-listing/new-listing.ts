import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { PropertyService } from '../../../core/services/property.service';
import { AuthService } from '../../../core/services/auth.service';
import { PropertyRequest } from '../../../core/models/property.model';

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

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      images: [''],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const ownerId = this.authService.getUserId();
    if (ownerId === null) {
      this.error.set(
        "Impossible de récupérer votre identifiant. Reconnecte-toi (ou le backend doit inclure l'id dans le token).",
      );
      return;
    }

    const raw = this.form.value;
    const request: PropertyRequest = {
      description: raw.description.trim(),
      address: raw.address.trim(),
      city: raw.city.trim(),
      images: this.parseImages(raw.images),
    };

    this.submitting.set(true);
    this.error.set(null);

    this.propertyService.createProperty(request, ownerId).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/owner/listings']), 1200);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.error.set(
          err?.status === 403
            ? 'Accès refusé : connecte-toi avec un compte OWNER.'
            : "Échec de la création de l'annonce. Backend démarré sur :8080 ?",
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
