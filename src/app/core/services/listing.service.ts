import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Page } from '../models/property.model';
import { ListingRequest, ListingResponse } from '../models/listing.model';

@Injectable({
  providedIn: 'root',
})
export class ListingService {
  private apiUrl = 'http://localhost:8080/api/listings';

  constructor(private http: HttpClient) {}

  // -------------------- OWNER --------------------

  /** POST /listings?ownerId= */
  createListing(request: ListingRequest, ownerId: number): Observable<ListingResponse> {
    const params = new HttpParams().set('ownerId', ownerId);
    return this.http.post<ListingResponse>(this.apiUrl, request, { params });
  }

  /** PATCH /listings/{id}/submit?ownerId= */
  submitListing(id: number, ownerId: number): Observable<ListingResponse> {
    const params = new HttpParams().set('ownerId', ownerId);
    return this.http.patch<ListingResponse>(`${this.apiUrl}/${id}/submit`, {}, { params });
  }

  /** GET /listings/my?ownerId= */
  getMyListings(ownerId: number): Observable<ListingResponse[]> {
    const params = new HttpParams().set('ownerId', ownerId);
    return this.http.get<ListingResponse[]>(`${this.apiUrl}/my`, { params });
  }

  /** DELETE /listings/{id}?ownerId= */
  deleteListing(id: number, ownerId: number): Observable<void> {
    const params = new HttpParams().set('ownerId', ownerId);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { params });
  }

  // -------------------- ADMIN --------------------

  /** GET /listings/pending (paginated) */
  getPendingListings(page = 0, size = 50): Observable<Page<ListingResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<ListingResponse>>(`${this.apiUrl}/pending`, { params });
  }

  /** PATCH /listings/{id}/approve */
  approveListing(id: number): Observable<ListingResponse> {
    return this.http.patch<ListingResponse>(`${this.apiUrl}/${id}/approve`, {});
  }

  /** PATCH /listings/{id}/reject */
  rejectListing(id: number): Observable<ListingResponse> {
    return this.http.patch<ListingResponse>(`${this.apiUrl}/${id}/reject`, {});
  }

  // -------------------- PUBLIC / TENANT --------------------

  /** GET /listings/search (paginated, optional filters) */
  searchListings(
    filters: { keyword?: string; city?: string; type?: string } = {},
    page = 0,
    size = 50,
  ): Observable<Page<ListingResponse>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('keyword', filters.keyword ?? '');
    if (filters.city) params = params.set('city', filters.city);
    if (filters.type) params = params.set('type', filters.type);
    return this.http.get<Page<ListingResponse>>(`${this.apiUrl}/search`, { params });
  }

  /** GET /listings/{id} */
  getListingById(id: number): Observable<ListingResponse> {
    return this.http.get<ListingResponse>(`${this.apiUrl}/${id}`);
  }
}
