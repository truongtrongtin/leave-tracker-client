export async function fetchData(url: RequestInfo, option?: RequestInit) {
  const defaultOption: RequestInit = { credentials: "include", ...option };
  const response = await fetch(url, defaultOption);
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data.message);
  }
  return data;
}
