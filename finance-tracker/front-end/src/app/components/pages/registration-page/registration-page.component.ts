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

@Component({
  selector: 'app-registration-page',
  standalone: true,
  imports: [
    FormsModule, 
    ReactiveFormsModule
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

    if (this.form.valid) {
      //@ts-ignore
      this.authService.register(this.form.value).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.registrationSuccess = true;
          this.successMessage = 'Registration successful! Redirecting to login page...';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err: any) => {
          this.isLoading = false;
          if (err.error) {
            const errors = err.error;
            for (const field in errors) {
              if (Array.isArray(errors[field])) {
                this.errorMessages.push(...errors[field]);
              } else {
                this.errorMessages.push(errors[field]);
              }
            }
          } else {
            this.errorMessages.push('Registration failed. Please try again.');
          }
        }
      });
    } else {
      this.isLoading = false;
    }
  }
}
