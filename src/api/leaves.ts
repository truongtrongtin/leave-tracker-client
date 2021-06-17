import { api } from './base';
import { User } from './users';

export interface Leave {
  id: string;
  startAt: string;
  endAt: string;
  reason: string;
  status: string;
  user: User;
}

export interface LeaveResponse {
  items: Leave[];
  meta: object;
  links: object;
}

export async function getAllLeavesApi(): Promise<LeaveResponse> {
  return await api.get('leaves').json();
}

export async function getMyLeavesApi(): Promise<any> {
  return await api.get('leaves/me').json();
}

export async function getMyLeaveSumApi(): Promise<any> {
  return await api.get('leaves/getMyLeaveSum').json();
}

export async function getAllUsersLeaveSumApi(year: number): Promise<any> {
  return await api
    .get('leaves/getAllUsersLeaveSum', {
      searchParams: { year: year.toString() },
    })
    .json();
}

export async function addLeaveApi(body: {
  startAt: string;
  endAt: string;
  reason: string;
  userId?: string;
}): Promise<any> {
  return await api
    .post('leaves/add', { body: new URLSearchParams(body) })
    .json();
}

export async function editLeaveApi(
  leaveId: string,
  body: {
    startAt: string;
    endAt: string;
    reason: string;
    userId?: string;
  },
): Promise<any> {
  return await api
    .post(`leaves/${leaveId}/edit`, { body: new URLSearchParams(body) })
    .json();
}

export async function deleteLeaveApi(leaveId: string) {
  return await api.post(`leaves/${leaveId}/delete`);
}
