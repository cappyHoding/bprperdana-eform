/**
 * client.ts
 *
 * Single axios instance yang dipakai oleh semua API module.
 *
 * INTERCEPTORS:
 *   Request  → inject X-Session-Token header secara otomatis dari sessionStorage
 *   Response → log + translate HTTP errors ke pesan yang user-friendly
 *
 * CATATAN:
 * - Tidak ada redirect ke /login di sini karena ini customer-facing app,
 *   bukan admin dashboard. Jika session expired, error dilempar ke caller
 *   dan wizard akan handle (misal: tampilkan modal "session expired").
 * - baseURL dibaca dari env VITE_API_BASE_URL (wajib diset di .env)
 */

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { getSessionToken } from '@/lib/session';

// Env variable dari Vite. Fallback ke localhost untuk development.
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081/api/v1';

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────

client.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Inject session token jika ada.
    // Backend middleware RequireCustomerSession akan baca header ini.
    const token = getSessionToken();
    if (token && config.headers) {
      config.headers['X-Session-Token'] = token;
    }

    if (import.meta.env.DEV) {
      console.log(
        `→ [API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

client.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    if (import.meta.env.DEV) {
      console.log(
        `← [API] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`
      );
    }
    return response;
  },
  (error: AxiosError | Error): Promise<never> => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const serverMessage =
        (error.response?.data as any)?.message ?? error.message;

      if (import.meta.env.DEV) {
        console.error(
          `✗ [API] ${status} ${error.config?.method?.toUpperCase()} ${error.config?.url} — ${serverMessage}`
        );
      }

      // Enrich error message dengan pesan dari server agar caller bisa
      // langsung tampilkan ke user tanpa perlu parsing ulang.
      error.message = serverMessage;
    }

    return Promise.reject(error);
  }
);

export default client;