export  type Role = 'ADMIN' | 'OWNER' | 'TENANT';

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  enabled: boolean;
  createdAt: string;
}

export const ROLES: Role[] = ['ADMIN', 'OWNER', 'TENANT'];
