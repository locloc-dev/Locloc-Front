import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LoginResponse } from '../models/login-response.model';
import { RegisterRequest } from '../models/register-request.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) {
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
}
