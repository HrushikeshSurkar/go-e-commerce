import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/ecommerce.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/v1/auth';
  private readonly tokenKey = 'ecommerce_jwt_token';

  // State Signals
  readonly token = signal<string | null>(this.getStoredToken());
  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!this.token());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor(private readonly http: HttpClient) {
    if (this.token()) {
      this.fetchProfile().subscribe({
        error: () => this.logout()
      });
    }
  }

  register(payload: { name: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  login(payload: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  requestForgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password/request`, { email });
  }

  resetPassword(payload: { email: string; code: string; new_password: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password/reset`, payload);
  }

  fetchProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.token.set(null);
    this.currentUser.set(null);
  }

  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem(this.tokenKey, res.token);
    this.token.set(res.token);
    this.currentUser.set(res.user);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}
