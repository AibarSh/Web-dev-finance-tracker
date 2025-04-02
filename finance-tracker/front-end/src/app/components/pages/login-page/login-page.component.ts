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
  router : Router = inject(Router);

  form = new FormGroup({
    username : new FormControl<string | null>(null, Validators.required),
    password : new FormControl<string | null>(null, Validators.required)
  });

  onSubmit() {
    if (this.form.valid) {
      //@ts-ignore
      this.authService.login(this.form.value).subscribe(
        res => {
          this.router.navigate(['']);
          console.log(res);
        }
      )
    }
  }

}