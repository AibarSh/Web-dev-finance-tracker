import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { TokenResponse, UserLogin, UserRegistration } from './auth.interface';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  http : HttpClient = inject(HttpClient);
  router : Router = inject(Router);
  cookie : CookieService = inject(CookieService);

  apiUrl : string = 'localhost:0000/auth/'
  accessToken : string | null = '';
  refreshToken : string | null= ''; //it should redirect us back to the login page after rega

  registered : boolean = false;

  isRegistered() : boolean {
    return this.registered;
  }

  isAuthenticated() : boolean {
    if (!this.accessToken) {
      this.accessToken = this.cookie.get('accessToken');
      this.refreshToken = this.cookie.get('refreshToken');
    }
    return !!this.accessToken; 
  }

  register(payload: UserRegistration) {
    return this.http.post(this.apiUrl, payload).pipe( //TODO:  add actual url later
      tap(
        () => this.registered = true
      )
    );
  }

  login(payload: UserLogin) {
    return this.http.post<TokenResponse>(this.apiUrl, payload) //TODO: add actual url later
      .pipe(
        tap(res => {
          this.saveTokens(res);
        })
      );
  }

  refreshAuthToken() {
    return this.http.post<TokenResponse>(`${this.apiUrl}refresh`, { //TODO: add actual url later
      refresh_token: this.refreshToken
    }).pipe(
      tap(
        res => this.saveTokens(res)
      ),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    )
  }

  logout() {
    this.cookie.deleteAll();
    this.accessToken = null;
    this.refreshToken = null;
    this.router.navigate(['/login']);
  }

  saveTokens(res: TokenResponse) {
    this.accessToken = res.access;
    this.refreshToken = res.refresh;

    this.cookie.set('accessToken', this.accessToken);
    this.cookie.set('refreshToken', this.refreshToken);
  }

}