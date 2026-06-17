import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Role, UserResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  /** GET /api/users — list all users (ADMIN) */
  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.apiUrl);
  }

  /** PUT /api/users/{id}/role?role=OWNER — change a user's role (ADMIN) */
  changeRole(id: number, role: Role): Observable<UserResponse> {
    const params = new HttpParams().set('role', role);
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}/role`, {}, { params });
  }

  /** PUT /api/users/{id}/enable — reactivate a suspended user (ADMIN) */
  enableUser(id: number): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}/enable`, {});
  }

  /** PUT /api/users/{id}/disable — suspend a user (ADMIN) */
  disableUser(id: number): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}/disable`, {});
  }

  /** DELETE /api/users/{id} — delete a user (ADMIN) */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
}

constructor(private http: HttpClient) {}
}
