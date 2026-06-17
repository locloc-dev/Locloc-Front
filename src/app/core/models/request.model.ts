/** Matches the backend RequestType enum */
export type RequestType = 'VISIT' | 'RENT' | 'BUY';

/** Matches the backend RequestStatus enum */
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

/** Matches the backend RequestResponse DTO */
export interface RequestResponse {
  id: number;
  status: RequestStatus;
  type: RequestType;
  message: string | null;
  tenantName: string | null;
  tenantEmail: string | null;
}

/** Matches the backend RequestCreateDTO */
export interface RequestCreateDTO {
  listingId: number;
  type: RequestType;
  message: string;
}
