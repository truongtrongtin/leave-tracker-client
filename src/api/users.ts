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

export async function getMeApi() {
  return await api.get('users/me').json();
}

export async function getAllUsersBirthdayApi(): Promise<any> {
  return await api.get('users/dateOfBirth').json();
}

export async function editCurrentUserApi(body: any): Promise<any> {
  return await api
    .post('users/me/update', { body: new URLSearchParams(body) })
    .json();
}

export async function updateCurrentUserPasswordApi(body: any): Promise<any> {
  return await api
    .post('users/me/updatePassword', { body: new URLSearchParams(body) })
    .json();
}

export async function editCurrentUserAvatarApi(body: any): Promise<any> {
  return await api.post('users/me/updateAvatar', { body }).json();
}

export async function deleteCurrentUserApi(userId: string): Promise<any> {
  return await api.post(`users/${userId}/delete`);
}
