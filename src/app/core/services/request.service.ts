import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Page } from '../models/property.model';
import { RequestCreateDTO, RequestResponse } from '../models/request.model';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  // ⚠️ If you get a 404, check your RequestController @RequestMapping
  // and switch this to 'http://localhost:8080/api/requests' if needed.
  private apiUrl = 'http://localhost:8080/requests';

  constructor(private http: HttpClient) {}

  /** POST /requests — tenant sends a request on a listing */
  createRequest(dto: RequestCreateDTO): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(this.apiUrl, dto);
  }

  /** GET /requests/me — current user's requests (paginated) */
  getMyRequests(page = 0, size = 50): Observable<Page<RequestResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<RequestResponse>>(`${this.apiUrl}/me`, { params });
  }
  // -------------------- OWNER --------------------

  /** GET /requests/listing/{listingId} — requests received on one listing */
  getListingRequests(listingId: number, page = 0, size = 50): Observable<Page<RequestResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<RequestResponse>>(
      `${this.apiUrl}/listing/${listingId}`,
      { params },
    );
  }

  /** PUT /requests/{id}/accept */
  acceptRequest(id: number): Observable<RequestResponse> {
    return this.http.put<RequestResponse>(`${this.apiUrl}/${id}/accept`, {});
  }

  /** PUT /requests/{id}/reject */
  rejectRequest(id: number): Observable<RequestResponse> {
    return this.http.put<RequestResponse>(`${this.apiUrl}/${id}/reject`, {});
  }
}
