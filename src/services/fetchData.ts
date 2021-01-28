export async function fetchData(endpoint: string, option?: RequestInit) {
  const defaultOption: RequestInit = { credentials: "include", ...option };
  let response;
  response = await fetch(
    process.env.REACT_APP_API_URL! + endpoint,
    defaultOption
  );
  if (response.status === 403) {
    response = await fetch(process.env.REACT_APP_API_URL! + "/auth/refresh", {
      credentials: "include",
    });
    if (response.ok) {
      response = await fetch(
        process.env.REACT_APP_API_URL! + endpoint,
        defaultOption
      );
    }
  }
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data.message);
  }
  return data;
}
