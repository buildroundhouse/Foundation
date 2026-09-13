type ApiRequestOptions = RequestInit & {
  token?: string | null;
};

export type ApiConnectionState =
  | 'unconfigured'
  | 'checking'
  | 'ready'
  | 'offline';

const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const apiBaseUrl = configuredUrl?.replace(/\/+$/, '') ?? null;
export const isApiConfigured = Boolean(apiBaseUrl);

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function apiUrl(path: string) {
  if (!apiBaseUrl) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured.');
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}

async function readResponse(response: Response): Promise<unknown> {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('json')) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text;
    }
  }

  return text;
}

export async function apiRequest<T>(
  path: string,
  { token, headers: suppliedHeaders, ...options }: ApiRequestOptions = {},
): Promise<T> {
  const headers = new Headers(suppliedHeaders);
  headers.set('Accept', 'application/json');

  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(apiUrl(path), { ...options, headers });
  const body = await readResponse(response);

  if (!response.ok) {
    const serverMessage = body && typeof body === 'object'
      ? (body as { error?: unknown; message?: unknown }).error
        ?? (body as { message?: unknown }).message
      : body;
    const detail = typeof serverMessage === 'string' ? `: ${serverMessage}` : '';
    throw new ApiError(response.status, `API request failed (${response.status})${detail}`, body);
  }

  return body as T;
}

export async function checkApiHealth(signal?: AbortSignal) {
  return apiRequest<{ status: string }>('/api/healthz', { signal });
}
