import ky from 'ky';

let refreshTokenPromise: Promise<any> | null;

async function refreshToken() {
  if (!refreshTokenPromise) {
    refreshTokenPromise = ky(`${process.env.REACT_APP_API_URL}/auth/refresh`, {
      credentials: 'include',
    });
    await refreshTokenPromise;
    refreshTokenPromise = null;
  }
  return refreshTokenPromise;
}

export const api = ky.create({
  prefixUrl: process.env.REACT_APP_API_URL,
  credentials: 'include',
  hooks: {
    afterResponse: [
      async (request, options, response): Promise<any> => {
        if (response.status === 403) {
          await refreshToken();
          return ky(request);
        }
        if (response.status > 300) {
          const body = await response.json();
          throw new Error(body.message);
        }
      },
    ],
  },
});
