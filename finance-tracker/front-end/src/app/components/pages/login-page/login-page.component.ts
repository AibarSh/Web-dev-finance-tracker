import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);

  form = new FormGroup({
    email: new FormControl<string | null>(null, Validators.required),
    password: new FormControl<string | null>(null, Validators.required)
  });

  loginErrorMessages: string[] = [];
  isLoginFailed: boolean = false;
  isLoading: boolean = false;

  onSubmit() {
    this.loginErrorMessages = [];
    this.isLoginFailed = false;
    this.isLoading = true;

    if (this.form.valid) {
      // @ts-ignore
      this.authService.login(this.form.value).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.router.navigate(['/main']);
        },
        error: (err: any) => {
          this.isLoading = false;
          this.isLoginFailed = true;

          if (err.error) {
            const errorData = err.error;

            if (errorData.detail) {
              this.loginErrorMessages.push(errorData.detail);
            } else {
              for (const field in errorData) {
                const messages = errorData[field];
                if (Array.isArray(messages)) {
                  this.loginErrorMessages.push(...messages);
                } else {
                  this.loginErrorMessages.push(messages);
                }
              }
            }
          } else {
            this.loginErrorMessages.push('Login failed. Please try again.');
          }
        }
      });
    } else {
      this.isLoading = false;
    }
  }
}
