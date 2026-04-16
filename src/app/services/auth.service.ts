import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) {}

  signup(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }

  // TOKEN STORE
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // TOKEN GET
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  getUser() {
    const token = localStorage.getItem('token');

    if (!token) return null;

  // JWT decode (basic)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.email || payload.username;
    } catch (e) {
      return null;
    }
  }
  // LOGIN CHECK
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // LOGOUT
  logout(): void {
    localStorage.removeItem('token');
  }
}