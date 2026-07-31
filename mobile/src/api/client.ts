import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';

const TOKEN_KEY = 'epanaw_token';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
};

function safeJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, signal } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (e) {
    throw new ApiError('Network error. Check your connection and the API URL.', 0);
  }

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data?.errors);
  }

  return data as T;
}

export type UploadFile = { uri: string; name: string; type: string };

/**
 * Upload a single file as multipart/form-data. Do NOT set Content-Type
 * manually — fetch adds the multipart boundary automatically.
 */
export async function apiUpload<T>(path: string, file: UploadFile): Promise<T> {
  const token = await getToken();

  const form = new FormData();
  // React Native FormData accepts a { uri, name, type } object for files.
  form.append('file', { uri: file.uri, name: file.name, type: file.type } as any);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: form,
    });
  } catch (e) {
    throw new ApiError('Network error during upload. Check your connection.', 0);
  }

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) || `Upload failed (${res.status})`;
    throw new ApiError(message, res.status, data?.errors);
  }

  return data as T;
}
