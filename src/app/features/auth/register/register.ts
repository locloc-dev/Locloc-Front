import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,

  imports: [CommonModule, ReactiveFormsModule],

  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerForm: FormGroup;

  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  selectedRole = 'TENANT';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],

      lastName: ['', [Validators.required]],

      email: ['', [Validators.required, Validators.email]],

      password: ['', [Validators.required, Validators.minLength(6)]],

      confirmPassword: ['', [Validators.required]],

      role: ['TENANT', [Validators.required]],
    });
  }

  onSubmit(): void {
    console.log('SUBMIT');

    console.log(this.registerForm.value);

    console.log(this.registerForm.valid);

    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (this.registerForm.valid) {
      this.isLoading = true;

      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log(response);

          this.isLoading = false;

          this.router.navigate(['/login']);
        },

        error: (error) => {
          console.error(error);

          this.isLoading = false;
        },
      });
    }
  }

  selectRole(role: string): void {

    this.selectedRole = role;

    this.registerForm.patchValue({
      role: role
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
