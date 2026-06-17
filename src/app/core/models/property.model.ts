export type PropertyStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** Matches the backend PropertyResponse DTO */
export interface PropertyResponse {
  id: number;
  description: string;
  address: string;
  city: string;
  ownerId: number;
  status: PropertyStatus;
  images: string[];
}

/** Matches the backend PropertyRequest DTO */
export interface PropertyRequest {
  description: string;
  address: string;
  city: string;
  images: string[];
}

/** Spring Data Page<T> shape returned by paginated endpoints */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
