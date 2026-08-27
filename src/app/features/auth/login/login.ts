import { AfterViewInit, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../core/services/auth.service';
import {Router, RouterLink} from '@angular/router';
import { LoginResponse } from '../../../core/models/login-response.model';
import { GOOGLE_CLIENT_ID } from '../../../core/config/google.config';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterLink,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit {
  @ViewChild('googleBtn') googleBtn!: ElementRef<HTMLDivElement>;

  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],

      password: ['', [Validators.required]],
    });
  }

  ngAfterViewInit(): void {
    this.initGoogleSignIn();
  }

  private initGoogleSignIn(attempt = 0): void {
    if (typeof google === 'undefined' || !google.accounts?.id) {
      if (attempt < 20) {
        setTimeout(() => this.initGoogleSignIn(attempt + 1), 150);
      } else {
        console.error('Google Identity Services failed to load.');
      }
      return;
    }

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: { credential: string }) => this.handleGoogleCredential(response),
    });

    google.accounts.id.renderButton(this.googleBtn.nativeElement, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'center',
      width: 320,
    });
  }

  private handleGoogleCredential(response: { credential: string }): void {
    this.ngZone.run(() => {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.loginWithGoogle(response.credential).subscribe({
        next: (res: LoginResponse) => this.handleAuthSuccess(res),
        error: (error) => {
          this.isLoading = false;
          console.error(error);
          this.errorMessage = error.error?.message || 'La connexion Google a échoué. Réessaie.';
        },
      });
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response: LoginResponse) => this.handleAuthSuccess(response),

        error: (error) => {
          this.isLoading = false;
          console.error(error);

          if (error.status === 0) {
            this.errorMessage =
              'Impossible de joindre le serveur. Vérifie que le backend est démarré.';
          } else if (error.status === 401 || error.status === 403) {
            this.errorMessage = error.error?.message || 'Email ou mot de passe incorrect.';
          } else {
            this.errorMessage = error.error?.message || 'Une erreur est survenue. Réessaie.';
          }
        },
      });
    }
  }

  private handleAuthSuccess(response: LoginResponse): void {
    this.isLoading = false;

    localStorage.setItem('token', response.token);
    localStorage.setItem('role', response.role);
    localStorage.setItem('userId', String(response.id));
    localStorage.setItem('firstName', response.firstName ?? '');
    localStorage.setItem('lastName', response.lastName ?? '');

    const role = response.role;

    if (role === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else if (role === 'OWNER') {
      this.router.navigate(['/owner']);
    } else {
      this.router.navigate(['/app/listings']);
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
