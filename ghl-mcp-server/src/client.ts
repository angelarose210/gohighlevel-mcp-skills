/**
 * GoHighLevel API HTTP Client
 *
 * Handles authentication, rate limiting, retries, and error normalization
 * for all GHL API v2 requests.
 *
 * Auth: Private Integration Token via GHL_API_KEY env var.
 * Location: Auto-injected from GHL_LOCATION_ID env var.
 */

const BASE_URL = "https://services.leadconnectorhq.com";
const API_VERSION = "2021-07-28";
const MAX_RETRIES = 3;
const RETRY_DELAYS = [500, 1000, 2000]; // ms, exponential backoff

export interface GHLClientConfig {
  apiKey: string;
  locationId: string;
}

export interface GHLRequestOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  params?: Record<string, unknown>;
  body?: Record<string, unknown>;
  /** Skip auto-injecting locationId (for agency-level endpoints) */
  skipLocationId?: boolean;
}

export interface GHLResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
  error?: string;
}

/**
 * Validate that required env vars are set. Returns config or throws descriptive error.
 */
export function getConfig(): GHLClientConfig {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey) {
    throw new Error(
      "GHL_API_KEY environment variable is not set.\n\n" +
        "To get your Private Integration Token:\n" +
        "1. Go to your GHL sub-account Settings > Integrations > API Key\n" +
        "2. Copy the Private Integration Token\n" +
        "3. Set it: export GHL_API_KEY=your_token_here"
    );
  }

  if (!locationId) {
    throw new Error(
      "GHL_LOCATION_ID environment variable is not set.\n\n" +
        "To find your Location ID:\n" +
        "1. Go to your GHL sub-account Settings > Business Profile\n" +
        "2. The Location ID is in the URL or Business Info section\n" +
        "3. Set it: export GHL_LOCATION_ID=your_location_id_here"
    );
  }

  return { apiKey, locationId };
}

/**
 * Build query string from params object, filtering out undefined/null values.
 */
function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Replace path parameters like {contactId} with actual values from params.
 * Returns the resolved path and remaining params (non-path params).
 */
function resolvePath(
  path: string,
  params?: Record<string, unknown>
): { resolvedPath: string; remainingParams: Record<string, unknown> } {
  if (!params) return { resolvedPath: path, remainingParams: {} };

  const remaining = { ...params };
  const resolvedPath = path.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const value = remaining[key];
    if (value === undefined || value === null) {
      throw new Error(`Missing required path parameter: ${key}`);
    }
    delete remaining[key];
    return encodeURIComponent(String(value));
  });

  return { resolvedPath, remainingParams: remaining };
}

/**
 * Sleep helper for retry delays.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main API request function. Handles auth, path resolution, query params,
 * rate limit retries, and error normalization.
 */
export async function ghlRequest<T = unknown>(
  options: GHLRequestOptions
): Promise<GHLResponse<T>> {
  const config = getConfig();
  const { method, path, body, skipLocationId } = options;
  let params = options.params ? { ...options.params } : {};

  // Auto-inject locationId for sub-account endpoints
  if (!skipLocationId && !params.locationId && method === "GET") {
    params.locationId = config.locationId;
  }
  if (
    !skipLocationId &&
    body &&
    !body.locationId &&
    (method === "POST" || method === "PUT" || method === "PATCH")
  ) {
    body.locationId = config.locationId;
  }

  // Resolve path parameters
  const { resolvedPath, remainingParams } = resolvePath(path, params);

  // Build URL
  const queryString =
    method === "GET" ? buildQueryString(remainingParams) : "";
  const url = `${BASE_URL}${resolvedPath}${queryString}`;

  // Request headers
  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    Version: API_VERSION,
  };

  // Retry loop
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const fetchOptions: RequestInit = { method, headers };

      if (body && method !== "GET") {
        // For POST/PUT/PATCH, include non-path params in the body too
        const mergedBody = { ...body };
        // Add remaining query-like params to body for non-GET requests
        for (const [key, value] of Object.entries(remainingParams)) {
          if (!(key in mergedBody) && value !== undefined) {
            mergedBody[key] = value;
          }
        }
        fetchOptions.body = JSON.stringify(mergedBody);
      } else if (method !== "GET" && Object.keys(remainingParams).length > 0) {
        // POST/PUT/PATCH with no explicit body but has params
        fetchOptions.body = JSON.stringify(remainingParams);
      }

      const response = await fetch(url, fetchOptions);

      // Rate limited — retry with backoff
      if (response.status === 429 && attempt < MAX_RETRIES) {
        const delay = RETRY_DELAYS[attempt] ?? 2000;
        await sleep(delay);
        continue;
      }

      // Parse response
      let data: T;
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        data = (await response.json()) as T;
      } else {
        const text = await response.text();
        data = text as unknown as T;
      }

      if (!response.ok) {
        const errorMsg = extractErrorMessage(data, response.status);
        return {
          ok: false,
          status: response.status,
          data,
          error: errorMsg,
        };
      }

      return { ok: true, status: response.status, data };
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        const message =
          err instanceof Error ? err.message : "Unknown request error";
        return {
          ok: false,
          status: 0,
          data: null as unknown as T,
          error: `Request failed after ${MAX_RETRIES + 1} attempts: ${message}`,
        };
      }
      const delay = RETRY_DELAYS[attempt] ?? 2000;
      await sleep(delay);
    }
  }

  // Should never reach here
  return {
    ok: false,
    status: 0,
    data: null as unknown as T,
    error: "Unexpected error in request retry loop",
  };
}

/**
 * Extract a human-readable error message from the API response.
 */
function extractErrorMessage(data: unknown, status: number): string {
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (typeof obj.message === "string") return `[${status}] ${obj.message}`;
    if (typeof obj.error === "string") return `[${status}] ${obj.error}`;
    if (typeof obj.msg === "string") return `[${status}] ${obj.msg}`;
  }

  const statusMessages: Record<number, string> = {
    400: "Bad request — check your parameters",
    401: "Unauthorized — check your GHL_API_KEY",
    403: "Forbidden — your API key may lack the required scope",
    404: "Not found — the resource doesn't exist",
    422: "Validation error — check field values",
    429: "Rate limited — too many requests",
    500: "GHL server error — try again later",
  };

  return statusMessages[status] ?? `HTTP ${status} error`;
}

/**
 * Convenience: format a successful response for MCP tool output.
 */
export function formatResponse(response: GHLResponse): string {
  if (!response.ok) {
    return JSON.stringify({ error: response.error, status: response.status }, null, 2);
  }
  return JSON.stringify(response.data, null, 2);
}
