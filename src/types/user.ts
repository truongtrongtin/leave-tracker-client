export enum Role {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatar: string;
  dateOfBirth?: Date;
}
