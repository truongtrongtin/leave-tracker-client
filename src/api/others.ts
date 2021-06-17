import { api } from './base';

export async function getAllHolidaysApi(): Promise<any> {
  return await api.get('holidays').json();
}
