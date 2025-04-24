import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);

  email: string = '';
  password: string = '';

  loginErrorMessages: string[] = [];
  isLoginFailed: boolean = false;
  isLoading: boolean = false;

  onLogin() {
    this.loginErrorMessages = [];
    this.isLoginFailed = false;
    this.isLoading = true;

    const formData = {
      email: this.email,
      password: this.password
    };

    this.authService.login(formData).subscribe({
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
  }
}
