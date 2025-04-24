import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable,EventEmitter } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { TokenResponse, UserLogin, UserRegistration } from './auth.interface';
import { UserFinanceData} from '../user-interfaces/user-interfaces.interface';
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
  logoutMessage = new EventEmitter<{ text: string, type: 'success' | 'error' }>();
  registered: boolean = false;

  getUserData(): Observable<UserFinanceData> {
    const token = this.getToken();
    if (!token) {
      console.error('No token available');
      return throwError(() => new Error('No token available'));
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<UserFinanceData>(`${this.apiUrl}user-full-data/`, { headers });
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

  logout(): void {
    const headers = {
      Authorization: `Bearer ${this.accessToken}`
    };

    // Send refresh token in body if available
    const body = this.refreshToken ? { refresh: this.refreshToken } : {};

    this.http.post(`${this.apiUrl}logout/`, body,{ headers })
      .subscribe({
        next: (response: any) => {
          this.logoutMessage.emit({ text: response.message || 'Successfully logged out', type: 'success' });
          this.completeLogout();
        },
        error: (err) => {
          this.logoutMessage.emit({
            text: err.error?.error || 'Failed to log out. Please try again.',
            type: 'error'
          });
          this.completeLogout(); // Proceed to clear client-side data even if server fails
        }
      });
  }

  private completeLogout(): void {
    // Clear specific cookies
    this.cookie.delete('accessToken');
    this.cookie.delete('refreshToken');

    // Clear tokens
    this.accessToken = null;
    this.refreshToken = null;

    // Redirect to login
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
