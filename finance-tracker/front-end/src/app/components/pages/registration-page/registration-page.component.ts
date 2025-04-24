import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration-page',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './registration-page.component.html',
  styleUrl: './registration-page.component.css'
})
export class RegistrationPageComponent {
  // input values
  username = '';
  email = '';
  password = '';
  password2 = '';

  isLoading = false;
  registrationSuccess = false;
  successMessage = '';
  errorMessages: string[] = [];

  authService = inject(AuthService);
  router = inject(Router);

  register() {
    this.isLoading = true;
    this.errorMessages = [];
    this.successMessage = '';
    this.registrationSuccess = false;

    // Simple validation
    if (!this.username || !this.email || !this.password || !this.password2) {
      this.isLoading = false;
      this.errorMessages.push('Please fill in all fields.');
      return;
    }

    const formData = {
      username: this.username,
      email: this.email,
      password: this.password,
      password2: this.password2
    };

    this.authService.register(formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.registrationSuccess = true;
        this.successMessage = 'Registration successful! Redirecting to login…';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err: any) => {
        this.isLoading = false;
        const payload = err.error;
        this.errorMessages = [];

        if (payload?.detail && typeof payload.detail === 'string') {
          this.errorMessages.push(payload.detail);
        } else if (Array.isArray(payload)) {
          this.errorMessages.push(...payload);
        } else if (payload && typeof payload === 'object') {
          for (const [field, msgs] of Object.entries(payload)) {
            const label = field.charAt(0).toUpperCase() + field.slice(1);
            const list = Array.isArray(msgs) ? msgs : [msgs];
            list.forEach(m => {
              this.errorMessages.push(label ? `${label}: ${m}` : String(m));
            });
          }
        } else if (typeof payload === 'string') {
          this.errorMessages.push(payload);
        } else {
          this.errorMessages.push('Registration failed. Please try again later.');
        }
      }
    });
  }
}
