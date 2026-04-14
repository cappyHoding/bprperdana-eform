/**
 * client.ts
 *
 * Single axios instance yang dipakai oleh semua API module.
 *
 * INTERCEPTORS:
 *   Request  → inject X-Session-Token header otomatis dari localStorage
 *   Response → translate HTTP errors ke pesan user-friendly bahasa Indonesia
 */

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { getSessionToken, clearSession } from '@/lib/session';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081/api/v1';

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Pesan error berdasarkan HTTP status ──────────────────────────────────────

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Data yang dikirim tidak valid. Periksa kembali isian Anda.',
  401: 'Sesi Anda telah berakhir. Silakan mulai ulang pengajuan.',
  403: 'Anda tidak memiliki akses untuk melakukan tindakan ini.',
  404: 'Data tidak ditemukan.',
  408: 'Koneksi timeout. Periksa jaringan Anda dan coba lagi.',
  409: 'Pengajuan ini sudah pernah diproses sebelumnya.',
  422: 'Data tidak dapat diproses. Periksa kembali isian Anda.',
  429: 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.',
  500: 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.',
  502: 'Server sedang tidak dapat dijangkau. Coba lagi nanti.',
  503: 'Layanan sedang dalam pemeliharaan. Coba lagi nanti.',
};

// Pesan error berdasarkan konteks URL + method
// Key: "<METHOD>:<path-pattern>"
const CONTEXT_MESSAGES: Record<string, string> = {
  'POST:/applications/agree': 'Gagal menyimpan persetujuan. Coba lagi.',
  'POST:/applications': 'Gagal membuat pengajuan. Coba lagi.',
  'POST:/ocr': 'Gagal membaca KTP. Pastikan foto jelas dan coba lagi.',
  'PATCH:/personal-info': 'Gagal menyimpan data pribadi. Coba lagi.',
  'GET:/liveness/token': 'Gagal memulai verifikasi wajah. Coba lagi.',
  'POST:/liveness': 'Gagal memverifikasi identitas. Coba foto ulang dengan pencahayaan yang baik.',
  'PATCH:/disbursement': 'Gagal menyimpan rekening bank. Periksa data dan coba lagi.',
  'PATCH:/collateral': 'Gagal menyimpan data agunan. Coba lagi.',
  'POST:/submit': 'Gagal mengirim pengajuan. Coba lagi.',
};

/**
 * Cari pesan kontekstual berdasarkan URL request.
 * Matching partial URL supaya tidak perlu exact match dengan :id.
 */
function getContextMessage(method: string, url: string): string | null {
  const key = `${method.toUpperCase()}:${url}`;
  for (const [pattern, message] of Object.entries(CONTEXT_MESSAGES)) {
    if (key.includes(pattern.split(':')[1])) {
      // Cek juga method-nya
      const [m] = pattern.split(':');
      if (key.startsWith(m + ':')) return message;
    }
  }
  return null;
}

/**
 * Ekstrak pesan error dari response backend.
 * Backend bisa return: { error: "..." } atau { message: "..." }
 */
function extractServerMessage(data: any): string | null {
  if (!data) return null;
  // Coba field 'error' dulu (format backend Go kita)
  if (typeof data.error === 'string' && data.error) return data.error;
  // Fallback ke 'message'
  if (typeof data.message === 'string' && data.message) return data.message;
  return null;
}

/**
 * Terjemahkan pesan teknikal backend ke bahasa Indonesia yang user-friendly.
 * Beberapa error backend memang sudah dalam bahasa Indonesia, biarkan apa adanya.
 */
function translateServerMessage(raw: string): string {
  const lower = raw.toLowerCase();

  // Session / auth errors
  if (lower.includes('session') && lower.includes('expired')) return 'Sesi Anda telah berakhir. Silakan mulai ulang pengajuan.';
  if (lower.includes('session not found') || lower.includes('invalid session')) return 'Sesi tidak valid. Silakan mulai ulang pengajuan.';
  if (lower.includes('unauthorized')) return 'Akses tidak diizinkan. Sesi mungkin sudah berakhir.';

  // Step errors
  if (lower.includes('step') && lower.includes('complete')) return 'Langkah sebelumnya belum diselesaikan. Silakan ulangi dari awal.';
  if (lower.includes('already submitted')) return 'Pengajuan ini sudah pernah dikirim sebelumnya.';
  if (lower.includes('not found')) return 'Data pengajuan tidak ditemukan.';

  // OCR errors
  if (lower.includes('ocr') || lower.includes('ktp')) return 'Gagal membaca KTP. Pastikan foto jelas, tidak buram, dan pencahayaan cukup.';
  if (lower.includes('invalid base64') || lower.includes('invalid image')) return 'Format foto tidak valid. Coba upload ulang.';

  // Liveness / fraud errors
  if (lower.includes('fraud') || lower.includes('liveness') || lower.includes('verification failed')) return 'Verifikasi identitas gagal. Pastikan wajah terlihat jelas saat foto selfie.';
  if (lower.includes('selfie')) return 'Foto selfie tidak valid. Coba ulangi verifikasi wajah.';

  // Network / server
  if (lower.includes('timeout')) return 'Koneksi timeout. Periksa jaringan dan coba lagi.';
  if (lower.includes('internal error') || lower.includes('internal server')) return 'Terjadi kesalahan pada server. Coba beberapa saat lagi.';

  // Validation
  if (lower.includes('required')) return 'Ada data wajib yang belum diisi. Periksa kembali form Anda.';
  if (lower.includes('invalid')) return 'Data yang dimasukkan tidak valid. Periksa kembali.';

  // Jika tidak ada match, kembalikan raw message apa adanya
  // (mungkin sudah dalam bahasa Indonesia dari backend)
  return raw;
}

// ─── Request Interceptor ──────────────────────────────────────────────────────

client.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getSessionToken();
    if (token && config.headers) {
      config.headers['X-Session-Token'] = token;
    }
    if (import.meta.env.DEV) {
      console.log(`→ [API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

client.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    if (import.meta.env.DEV) {
      console.log(`← [API] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  (error: AxiosError | Error): Promise<never> => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const method = error.config?.method ?? '';
      const url = error.config?.url ?? '';
      const data = error.response?.data as any;

      if (import.meta.env.DEV) {
        console.error(`✗ [API] ${status} ${method.toUpperCase()} ${url}`, data);
      }

      // Jika session expired (401), bersihkan session supaya user tidak stuck
      if (status === 401) {
        clearSession();
      }

      // Prioritas pesan:
      // 1. Pesan dari server (ditranslate jika perlu)
      // 2. Pesan kontekstual berdasarkan endpoint
      // 3. Pesan generik berdasarkan status code
      // 4. Fallback

      const serverRaw = extractServerMessage(data);
      const serverMsg = serverRaw ? translateServerMessage(serverRaw) : null;
      const contextMsg = getContextMessage(method, url);
      const statusMsg = status ? STATUS_MESSAGES[status] : null;

      error.message =
        serverMsg ??
        contextMsg ??
        statusMsg ??
        'Terjadi kesalahan. Silakan coba lagi.';
    } else {
      // Network error (tidak ada response sama sekali)
      if (error.message === 'Network Error') {
        error.message = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else if (error.message.toLowerCase().includes('timeout')) {
        error.message = 'Koneksi timeout. Periksa jaringan dan coba lagi.';
      }
    }

    return Promise.reject(error);
  }
);

export default client;