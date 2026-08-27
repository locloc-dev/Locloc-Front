import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) {
      this.form.patchValue({ email });
    }
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.value.newPassword !== this.form.value.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isLoading = true;

    const { email, code, newPassword } = this.form.value;

    this.authService.resetPassword(email, code, newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage =
          'Mot de passe réinitialisé ! Redirection vers la connexion...';
        setTimeout(() => this.router.navigate(['/login']), 1800);
      },
      error: (error) => {
        this.isLoading = false;
        console.error(error);
        if (error.status === 0) {
          this.errorMessage =
            'Impossible de joindre le serveur. Vérifie que le backend est démarré.';
        } else if (error.status === 400) {
          this.errorMessage =
            error.error?.message || 'Code invalide ou expiré.';
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
