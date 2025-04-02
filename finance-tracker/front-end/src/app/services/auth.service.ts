import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api/auth/'; // Путь к API на бэкенде
  private tokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}login/`, { username, password }).pipe(
      catchError(error => {
        throw error;
      })
    );
  }

  register(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}register/`, { username, password }).pipe(
      catchError(error => {
        throw error;
      })
    );
  }

  setToken(token: string): void {
    this.tokenSubject.next(token);
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return this.tokenSubject.value || localStorage.getItem('auth_token');
  }

  logout(): void {
    this.tokenSubject.next(null);
    localStorage.removeItem('auth_token');
  }
}
