/**
 * session.ts
 *
 * Manages customer session state for the eForm wizard.
 *
 * WHY sessionStorage (bukan localStorage)?
 * - sessionStorage otomatis dihapus saat tab/browser ditutup.
 * - Ini mencegah session lama "bocor" ke pengajuan baru.
 * - Per-tab: jika customer buka 2 tab pengajuan berbeda, tidak konflik.
 *
 * STRUKTUR SESSION:
 *   application_id  → UUID dari backend (dari Step 2)
 *   session_token   → raw token dari backend (dikirim di X-Session-Token header)
 *   product_type    → SAVING | DEPOSIT | LOAN
 *   current_step    → step terakhir yang sudah selesai di backend
 *   expires_at      → Unix timestamp (detik) kapan session expired
 *   agreement_token → short-lived token dari Step 1 (dipakai di Step 2, lalu dibuang)
 */

const KEYS = {
  APPLICATION_ID:  'eform_application_id',
  SESSION_TOKEN:   'eform_session_token',
  PRODUCT_TYPE:    'eform_product_type',
  CURRENT_STEP:    'eform_current_step',
  EXPIRES_AT:      'eform_expires_at',
  AGREEMENT_TOKEN: 'eform_agreement_token',
} as const;

export interface SessionData {
  applicationId: string;
  sessionToken: string;
  productType: string;
  currentStep: number;
  expiresAt: number; // Unix seconds
}

// ─── Save / Load ──────────────────────────────────────────────────────────────

/**
 * Simpan session setelah Step 2 (create application) berhasil.
 */
export function saveSession(data: SessionData): void {
  sessionStorage.setItem(KEYS.APPLICATION_ID, data.applicationId);
  sessionStorage.setItem(KEYS.SESSION_TOKEN,  data.sessionToken);
  sessionStorage.setItem(KEYS.PRODUCT_TYPE,   data.productType);
  sessionStorage.setItem(KEYS.CURRENT_STEP,   String(data.currentStep));
  sessionStorage.setItem(KEYS.EXPIRES_AT,     String(data.expiresAt));
}

/**
 * Load session yang tersimpan. Returns null jika tidak ada atau sudah expired.
 */
export function loadSession(): SessionData | null {
  const applicationId = sessionStorage.getItem(KEYS.APPLICATION_ID);
  const sessionToken  = sessionStorage.getItem(KEYS.SESSION_TOKEN);
  const productType   = sessionStorage.getItem(KEYS.PRODUCT_TYPE);
  const currentStep   = sessionStorage.getItem(KEYS.CURRENT_STEP);
  const expiresAt     = sessionStorage.getItem(KEYS.EXPIRES_AT);

  if (!applicationId || !sessionToken || !expiresAt) return null;

  const expiresAtNum = Number(expiresAt);

  // Cek apakah session sudah expired
  if (Date.now() / 1000 > expiresAtNum) {
    clearSession();
    return null;
  }

  return {
    applicationId,
    sessionToken,
    productType:  productType  ?? '',
    currentStep:  Number(currentStep ?? 3),
    expiresAt:    expiresAtNum,
  };
}

/**
 * Hapus semua data session (dipakai saat submit berhasil atau user mulai ulang).
 */
export function clearSession(): void {
  Object.values(KEYS).forEach((key) => sessionStorage.removeItem(key));
}

// ─── Agreement Token (Step 1 → Step 2) ───────────────────────────────────────

/**
 * Simpan agreement_token dari Step 1.
 * Token ini hanya dipakai sekali di Step 2, lalu dibuang.
 */
export function saveAgreementToken(token: string): void {
  sessionStorage.setItem(KEYS.AGREEMENT_TOKEN, token);
}

/**
 * Ambil agreement_token dan langsung hapus (one-time use).
 */
export function consumeAgreementToken(): string | null {
  const token = sessionStorage.getItem(KEYS.AGREEMENT_TOKEN);
  sessionStorage.removeItem(KEYS.AGREEMENT_TOKEN);
  return token;
}

// ─── Getters ──────────────────────────────────────────────────────────────────

export function getSessionToken(): string | null {
  return sessionStorage.getItem(KEYS.SESSION_TOKEN);
}

export function getApplicationId(): string | null {
  return sessionStorage.getItem(KEYS.APPLICATION_ID);
}

/**
 * Update current_step di session setelah setiap step berhasil.
 */
export function updateCurrentStep(step: number): void {
  sessionStorage.setItem(KEYS.CURRENT_STEP, String(step));
}

/**
 * Cek apakah ada session aktif (belum expired).
 */
export function hasActiveSession(): boolean {
  return loadSession() !== null;
}