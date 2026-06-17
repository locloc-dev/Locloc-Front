/** Matches the backend ListingType enum */
export type ListingType = 'RENT' | 'SALE';

/** Matches the backend ListingStatus enum */
export type ListingStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'AVAILABLE'
  | 'RENTED'
  | 'REJECTED';

/** Matches the backend ListingResponse DTO */
export interface ListingResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  type: ListingType;
  status: ListingStatus;
  createdAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  propertyId: number;
}

/** Matches the backend ListingRequest DTO */
export interface ListingRequest {
  title: string;
  description: string;
  price: number;
  type: ListingType;
  propertyId: number;
}
