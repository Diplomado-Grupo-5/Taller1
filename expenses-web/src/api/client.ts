const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('access_token');
  const headers: HeadersInit = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init && 'body' in init && init.body != null ? { 'Content-Type': 'application/json' } : {}),
    ...(init?.headers ?? {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('access_token');
      window.location.hash = '#/login';
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    }
    const errorText = await res.text();
    try {
      const json = JSON.parse(errorText);
      const message =
        (Array.isArray(json?.message) ? json.message.join(', ') : json?.message) ||
        json?.error ||
        `HTTP ${res.status}`;
      const err = new Error(String(message));
      (err as any).status = res.status;
      throw err;
    } catch {
      const err = new Error(errorText || `HTTP ${res.status}`);
      (err as any).status = res.status;
      throw err;
    }
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
