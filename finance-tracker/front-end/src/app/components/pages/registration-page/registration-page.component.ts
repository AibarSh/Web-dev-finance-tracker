import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-registration-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './registration-page.component.html',
  styleUrl: './registration-page.component.css'
})
export class RegistrationPageComponent {
  submitted = false;
  isLoading = false;

  registrationSuccess = false;
  successMessage = '';
  errorMessages: string[] = [];

  authService = inject(AuthService);
  router = inject(Router);


  private fieldLabels: Record<string,string> = {
    email:      'Email',
    username:   'Username',
    password:   'Password',
    non_field_errors: ''   // DRF puts some errors here
  };

  form = new FormGroup({
    username: new FormControl<string | null>(null, Validators.required),
    email: new FormControl<string | null>(null, [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl<string | null>(null, Validators.required),
    password2: new FormControl<string | null>(null, Validators.required)
  });

  onSubmit() {
    this.isLoading = true;
    this.submitted = true;
    this.errorMessages = [];
    this.successMessage = '';
    this.registrationSuccess = false;

    if (this.form.invalid) {
      this.isLoading = false;
      return;
    }

    const formData = {
      username: this.form.value.username || '',
      email: this.form.value.email || '',
      password: this.form.value.password || '',
      password2: this.form.value.password2 || ''
    } as { username: string; email: string; password: string; password2: string };

    this.authService.register(formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.registrationSuccess = true;
        this.successMessage = 'Registration successful! Redirecting to login…';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessages = [];

        console.error('🔥 registration error payload:', err.status, err.error);

        const payload = err.error;

        // 1) If DRF gave you a detail string
        if (payload?.detail && typeof payload.detail === 'string') {
          this.errorMessages.push(payload.detail);

        // 2) If it’s an array of messages
        } else if (Array.isArray(payload)) {
          this.errorMessages.push(...payload);

        // 3) If it’s an object (e.g. { email: ["…"], username: ["…"] })
        } else if (payload && typeof payload === 'object') {
          for (const [field, msgs] of Object.entries(payload)) {
            const label = this.fieldLabels[field] ?? field;
            const list = Array.isArray(msgs) ? msgs : [msgs];
            list.forEach(m => {
              this.errorMessages.push(label ? `${label}: ${m}` : String(m));
            });
          }

        // 4) If it’s just a string
        } else if (typeof payload === 'string') {
          this.errorMessages.push(payload);

        // 5) Fallback
        } else {
          this.errorMessages.push('Registration failed. Please try again later.');
        }
      }
    });
  }
}
