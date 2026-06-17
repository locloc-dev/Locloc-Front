import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Page,
  PropertyRequest,
  PropertyResponse,
} from '../models/property.model';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private apiUrl = 'http://localhost:8080/api/properties';

  constructor(private http: HttpClient) {}

  // -------------------- ADMIN --------------------

  /** GET /api/properties (paginated) */
  getAllProperties(page = 0, size = 20): Observable<Page<PropertyResponse>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<Page<PropertyResponse>>(this.apiUrl, { params });
  }

  /** GET /api/properties/pending */
  getPendingProperties(): Observable<PropertyResponse[]> {
    return this.http.get<PropertyResponse[]>(`${this.apiUrl}/pending`);
  }

  /** PUT /api/properties/{id}/approve */
  approveProperty(id: number): Observable<PropertyResponse> {
    return this.http.put<PropertyResponse>(`${this.apiUrl}/${id}/approve`, {});
  }

  /** PUT /api/properties/{id}/reject */
  rejectProperty(id: number): Observable<PropertyResponse> {
    return this.http.put<PropertyResponse>(`${this.apiUrl}/${id}/reject`, {});
  }

  // -------------------- PUBLIC --------------------

  /** GET /api/properties/approved — browse approved listings (public) */
  getApprovedProperties(): Observable<PropertyResponse[]> {
    return this.http.get<PropertyResponse[]>(`${this.apiUrl}/approved`);
  }

  /** GET /api/properties/{id} */
  getPropertyById(id: number): Observable<PropertyResponse> {
    return this.http.get<PropertyResponse>(`${this.apiUrl}/${id}`);
  }


  // -------------------- OWNER --------------------

  /** POST /api/properties?ownerId= */
  createProperty(request: PropertyRequest, ownerId: number): Observable<PropertyResponse> {
    const params = new HttpParams().set('ownerId', ownerId);
    return this.http.post<PropertyResponse>(this.apiUrl, request, { params });
  }

  /** PUT /api/properties/{id}?ownerId= */
  updateProperty(
    id: number,
    request: PropertyRequest,
    ownerId: number,
  ): Observable<PropertyResponse> {
    const params = new HttpParams().set('ownerId', ownerId);
    return this.http.put<PropertyResponse>(`${this.apiUrl}/${id}`, request, { params });
  }

  /** DELETE /api/properties/{id}?ownerId= */
  deleteProperty(id: number, ownerId: number): Observable<void> {
    const params = new HttpParams().set('ownerId', ownerId);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { params });
  }

  /** GET /api/properties/my?ownerId= */
  getMyProperties(ownerId: number): Observable<PropertyResponse[]> {
    const params = new HttpParams().set('ownerId', ownerId);
    return this.http.get<PropertyResponse[]>(`${this.apiUrl}/my`, { params });
  }
}
