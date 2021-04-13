export enum Role {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
}

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatar: string;
  dateOfBirth?: Date;
};
