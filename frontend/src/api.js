// Small fetch wrapper. Admin calls send HTTP Basic credentials kept in sessionStorage.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const KEY = "skolar_admin";

export const auth = {
  get: () => sessionStorage.getItem(KEY),
  set: (username, password) => sessionStorage.setItem(KEY, btoa(`${username}:${password}`)),
  clear: () => sessionStorage.removeItem(KEY),
  isLoggedIn: () => !!sessionStorage.getItem(KEY),
};

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || `Request failed (${status})`);
    this.status = status;
    this.fields = body?.fields || {};
  }
}

export async function api(path, { method = "GET", body, admin = false } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (admin) {
    const token = auth.get();
    if (token) headers.Authorization = `Basic ${token}`;
  }

  const res = await fetch(API_URL + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

export const money = (n) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(Number(n || 0));
