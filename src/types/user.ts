export enum Role {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
}

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  role: Role;
  avatar: string;
};
