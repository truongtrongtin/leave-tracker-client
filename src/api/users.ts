import { api } from './base';

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

export async function getAllUsersApi(): Promise<any> {
  return await api.get('users').json();
}

export async function getAllUsersBirthdayApi(): Promise<any> {
  return await api.get('users/dateOfBirth').json();
}

export async function editCurrentUserApi(body: any): Promise<any> {
  return await api
    .post('users/edit/me', { body: new URLSearchParams(body) })
    .json();
}
