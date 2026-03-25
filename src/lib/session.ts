/**
 * session.ts
 *
 * Manages customer session state for the eForm wizard.
 *
 * WHY localStorage (bukan sessionStorage)?
 * - localStorage persists saat refresh — memungkinkan resume wizard.
 * - Session tetap aman karena ada expires_at check.
 * - clearSession() dipanggil saat submit berhasil atau user mulai ulang.
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
  APPLICATION_ID: 'eform_application_id',
  SESSION_TOKEN: 'eform_session_token',
  PRODUCT_TYPE: 'eform_product_type',
  CURRENT_STEP: 'eform_current_step',
  EXPIRES_AT: 'eform_expires_at',
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

export function saveSession(data: SessionData): void {
  localStorage.setItem(KEYS.APPLICATION_ID, data.applicationId);
  localStorage.setItem(KEYS.SESSION_TOKEN, data.sessionToken);
  localStorage.setItem(KEYS.PRODUCT_TYPE, data.productType);
  localStorage.setItem(KEYS.CURRENT_STEP, String(data.currentStep));
  localStorage.setItem(KEYS.EXPIRES_AT, String(data.expiresAt));
}

export function loadSession(): SessionData | null {
  const applicationId = localStorage.getItem(KEYS.APPLICATION_ID);
  const sessionToken = localStorage.getItem(KEYS.SESSION_TOKEN);
  const productType = localStorage.getItem(KEYS.PRODUCT_TYPE);
  const currentStep = localStorage.getItem(KEYS.CURRENT_STEP);
  const expiresAt = localStorage.getItem(KEYS.EXPIRES_AT);

  if (!applicationId || !sessionToken || !expiresAt) return null;

  const expiresAtNum = Number(expiresAt);

  if (Date.now() / 1000 > expiresAtNum) {
    clearSession();
    return null;
  }

  return {
    applicationId,
    sessionToken,
    productType: productType ?? '',
    currentStep: Number(currentStep ?? 3),
    expiresAt: expiresAtNum,
  };
}

export function clearSession(): void {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}

// ─── Agreement Token ──────────────────────────────────────────────────────────

export function saveAgreementToken(token: string): void {
  localStorage.setItem(KEYS.AGREEMENT_TOKEN, token);
}

export function consumeAgreementToken(): string | null {
  const token = localStorage.getItem(KEYS.AGREEMENT_TOKEN);
  localStorage.removeItem(KEYS.AGREEMENT_TOKEN);
  return token;
}

// ─── Getters ──────────────────────────────────────────────────────────────────

export function getSessionToken(): string | null {
  return localStorage.getItem(KEYS.SESSION_TOKEN);
}

export function getApplicationId(): string | null {
  return localStorage.getItem(KEYS.APPLICATION_ID);
}

export function updateCurrentStep(step: number): void {
  localStorage.setItem(KEYS.CURRENT_STEP, String(step));
}

export function hasActiveSession(): boolean {
  return loadSession() !== null;
}

/**
 * Cek apakah ada session aktif untuk product type tertentu.
 * Dipakai di wizard untuk deteksi resume.
 */
export function getActiveSessionForProduct(productType: 'SAVING' | 'DEPOSIT' | 'LOAN'): SessionData | null {
  const session = loadSession();
  if (!session) return null;
  if (session.productType !== productType) return null;
  return session;
}