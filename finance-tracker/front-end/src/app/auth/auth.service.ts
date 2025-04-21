import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { TokenResponse, UserData, UserLogin, UserRegistration } from './auth.interface';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})


export class AuthService {
  http: HttpClient = inject(HttpClient);
  router: Router = inject(Router);
  cookie: CookieService = inject(CookieService);

  apiUrl: string = 'http://127.0.0.1:8000/api/';
  accessToken: string | null = '';
  refreshToken: string | null = '';

  registered: boolean = false;

  getUserData(): Observable<UserData> {
    const token = this.getToken();
    if (!token) {
      console.error('No token available');
      return throwError(() => new Error('No token available'));
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<UserData>(`${this.apiUrl}user-full-data/`, { headers });
  }


  getToken(): string {
    const token = this.cookie.get('accessToken');
    console.log('[getToken] Read from cookie:', token);
    return this.cookie.get('accessToken');

  }

  isRegistered(): boolean {
    return this.registered;
  }

  isAuthenticated(): boolean {
    if (!this.accessToken) {
      this.accessToken = this.cookie.get('accessToken');
      this.refreshToken = this.cookie.get('refreshToken');
    }
    return !!this.accessToken;
  }

  register(payload: UserRegistration) {
    return this.http.post(`${this.apiUrl}register/`, payload).pipe(
      tap(() => this.registered = true),
      catchError(err => {
        console.error('Registration failed', err);
        return throwError(() => err); // Если регистрация не прошла
      })
    );
  }

  login(payload: UserLogin) {
    console.log('Login request:', payload);

    return this.http.post<TokenResponse>(`${this.apiUrl}login/`, payload).pipe(
      tap(res => {
        console.log('Login success:', res); // Логируем успешный ответ
        this.saveTokens(res);
      }),
      catchError(err => {
        console.error('Login failed:', err); // Логируем ошибку
        return throwError(() => err); // Ретранслируем ошибку
      })
    );
  }

  refreshAuthToken() {
    return this.http.post<TokenResponse>(`${this.apiUrl}token/refresh/`, {
      refresh: this.refreshToken
    }).pipe(
      tap(res => this.saveTokens(res)),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  logout() {
    this.http.post(`${this.apiUrl}token/logout/`, {
      refresh: this.refreshToken
    }).subscribe(); // Не важно, что вернёт сервер, но это для завершения сессии

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

    console.log('[saveTokens] Token saved to cookie:', this.accessToken);
  }
}
