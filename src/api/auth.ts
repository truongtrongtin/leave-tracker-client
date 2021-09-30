import { api } from './base';

export async function signupApi(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
) {
  return await api
    .post('auth/signup', {
      body: new URLSearchParams({ email, password, firstName, lastName }),
    })
    .json();
}

export async function loginApi(email: string, password: string) {
  return await api
    .post('auth/login', {
      body: new URLSearchParams({ email, password }),
    })
    .json();
}

export async function logoutApi() {
  return await api.post('auth/logout');
}
