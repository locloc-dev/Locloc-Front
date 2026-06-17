import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { LoginResponse } from '../../../core/models/login-response.model';

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
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],

      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;

      this.authService.login(this.loginForm.value).subscribe({
        next: (response: LoginResponse) => {

          this.isLoading = false;

          console.log(response);

          localStorage.setItem(
            'token',
            response.token
          );

          localStorage.setItem(
            'role',
            response.role
          );
          localStorage.setItem(
            'userId',
            String(response.id)
          );
          const role = response.role;

          if (role === 'ADMIN') {

            this.router.navigate(['/admin']);

          } else if (role === 'OWNER') {

            this.router.navigate(['/owner']);

          } else {

            this.router.navigate(['/app/listings']);
          }
        },

        error: (error) => {
          this.isLoading = false;
          console.error(error);
        },
      });
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
