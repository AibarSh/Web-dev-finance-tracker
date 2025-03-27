import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'  // No need to import in a module
})
export class ApiService {
  private apiUrl = 'http://127.0.0.1:8000/api/pages/';

  constructor(private http: HttpClient) {}

  getPages(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
