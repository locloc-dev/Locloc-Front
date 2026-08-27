import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const email = this.form.value.email;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/reset-password'], { queryParams: { email } });
      },
      error: (error) => {
        this.isLoading = false;
        console.error(error);
        if (error.status === 0) {
          this.errorMessage =
            'Impossible de joindre le serveur. Vérifie que le backend est démarré.';
        } else {
          this.errorMessage =
            error.error?.message || 'Une erreur est survenue. Réessaie.';
        }
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
