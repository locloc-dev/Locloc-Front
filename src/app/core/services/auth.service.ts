import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LoginResponse } from '../models/login-response.model';
import { RegisterRequest } from '../models/register-request.model';
import { isTokenValid } from '../utils/token.util';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/auth';
  private usersUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {
  }


  becomeOwner(): Observable<any> {
    return this.http.put(`${this.usersUrl}/me/become-owner`, {});
  }

  setRole(role: string): void {
    localStorage.setItem('role', role);
  }

  login(data: any): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      data
    );
  }

  register(data: RegisterRequest): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/register`,
      data
    );
  }


  googleLogin(idToken: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/google`, { idToken });
  }

  loginWithGoogle(idToken: string): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/google`,
      { idToken }
    );
  }

  forgotPassword(email: string): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/forgot-password`,
      { email }
    );
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/reset-password`,
      { email, code, newPassword }
    );
  }

  isLoggedIn(): boolean {
    return isTokenValid(localStorage.getItem('token'));
  }

  getUserId(): number | null {

    const stored = localStorage.getItem('userId');
    if (stored) {
      const id = Number(stored);
      if (Number.isFinite(id)) {
        return id;
      }
    }


    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const raw = payload.id ?? payload.userId;
      const id = Number(raw);
      return Number.isFinite(id) ? id : null;
    } catch {
      return null;
    }
  }

  getFullName(): string {
    const first = localStorage.getItem('firstName') || '';
    const last = localStorage.getItem('lastName') || '';
    const name = `${first} ${last}`.trim();
    return name || this.getEmail() || 'Utilisateur';
  }

  getRole(): string {
    return localStorage.getItem('role') || '';
  }

  getEmail(): string {
    const token = localStorage.getItem('token');
    if (!token) {
      return '';
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || '';
    } catch {
      return '';
    }
  }
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isTokenExpired(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      return true;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) {
        return false;
      }
      return payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }

  clearSession(): void {
    ['token', 'role', 'userId', 'firstName', 'lastName'].forEach((key) =>
      localStorage.removeItem(key),
    );
  }
}
