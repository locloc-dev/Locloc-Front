export type PropertyStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type PropertyType =
  | 'APARTMENT'
  | 'HOUSE'
  | 'LAND'
  | 'COMMERCIAL'
  | 'OFFICE'
  | 'RIAD';

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'APARTMENT', label: 'Appartement' },
  { value: 'HOUSE', label: 'Villa / Maison' },
  { value: 'LAND', label: 'Terrain' },
  { value: 'COMMERCIAL', label: 'Local commercial' },
  { value: 'OFFICE', label: 'Bureau' },
  { value: 'RIAD', label: 'Riad' },
];

/** Matches the backend PropertyResponse DTO */
export interface PropertyResponse {
  id: number;
  description: string;
  address: string;
  city: string;
  ownerId: number;
  status: PropertyStatus;
  propertyType?: PropertyType | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  surface?: number | null;
  images: string[];

}

/** Matches the backend PropertyRequest DTO */
export interface PropertyRequest {
  description: string;
  address: string;
  city: string;
  propertyType: PropertyType;
  bedrooms?: number | null;
  bathrooms?: number | null;
  surface?: number | null;
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
