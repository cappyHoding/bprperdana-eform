/**
 * applicationApi.ts
 *
 * Semua API call untuk customer-facing wizard (Steps 1–7).
 * Setiap function match 1:1 dengan backend route.
 *
 * BACKEND ROUTES (untuk referensi):
 *   POST   /api/v1/applications/agree           → Step 1
 *   POST   /api/v1/applications                 → Step 2 (returns session_token)
 *   POST   /api/v1/applications/:id/ocr         → Step 3 [X-Session-Token]
 *   PATCH  /api/v1/applications/:id/personal-info → Step 4 [X-Session-Token]
 *   GET    /api/v1/applications/:id/liveness/token → Step 5 pre-init [X-Session-Token]
 *   POST   /api/v1/applications/:id/liveness    → Step 5 post-SDK [X-Session-Token]
 *   PATCH  /api/v1/applications/:id/disbursement → Step 6 [X-Session-Token]
 *   POST   /api/v1/applications/:id/submit      → Step 7 [X-Session-Token]
 */

import client from './client';
import { saveSession, saveAgreementToken, consumeAgreementToken, updateCurrentStep } from '@/lib/session';

// ─── Response Types ───────────────────────────────────────────────────────────

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

// Step 1 — Agreement
export interface AgreementResult {
  agreement_token: string;
  accepted_at: number;
}

// Step 2 — Create Application
export interface CreateApplicationResult {
  application_id: string;
  session_token: string;
  expires_at: number;
  product_type: string;
  current_step: number;
}

// Step 3 — OCR
export interface OcrResult {
  current_step: number;
  nik: string;
  full_name: string;
  birth_place: string;
  birth_date: string;
  gender: string;
  address: string;
  confidence: number;
  // Field tambahan dari backend
  rt_rw?: string;
  kelurahan?: string;
  kecamatan?: string;
  kabupaten_kota?: string;
  provinsi?: string;
  agama?: string;
  status_perkawinan?: string;
  pekerjaan?: string;
  kewarganegaraan?: string;
  berlaku_hingga?: string;
}

// Step 5 — Liveness Token (untuk VIDA Web SDK init)
export interface LivenessTokenResult {
  access_token: string;
  signing_key: string;   // ← sekarang dari backend
  token_type: string;
  expires_in: number;
  expires_at: string;
}

// ─── Request Payload Types ────────────────────────────────────────────────────

// Step 2 — Product-specific payloads
export interface SavingPayload {
  product_name: string;       // "Perdana" | "PerdanaPlus" | "TabunganKu"
  initial_deposit: number;
  source_of_funds: string;
  saving_purpose: string;
}

export interface DepositPayload {
  product_name: string;
  placement_amount: number;
  tenor_months: number;       // 1 | 3 | 6 | 12
  rollover_type: string;      // "aro" | "aroRate" | "nonAro"
  source_of_funds: string;
  investment_purpose: string;
}

export interface LoanPayload {
  product_name: string;       // "KreditModalKerja" | "KreditAnekaGuna"
  requested_amount: number;
  tenor_months: number;
  loan_purpose: string;
  payment_source: string;
  source_of_funds: string;
}

export interface CreateApplicationPayload {
  agreement_token: string;
  product_type: 'SAVING' | 'DEPOSIT' | 'LOAN';
  saving?: SavingPayload;
  deposit?: DepositPayload;
  loan?: LoanPayload;
}

// Step 4 — Personal Info
export interface PersonalInfoPayload {
  email: string;
  phone_number: string;
  phone_wa: string;
  mothers_maiden_name: string;
  occupation: string;
  work_duration: string;
  monthly_income: number;
  education: string;
  work_address: string;
}

// Step 6 — Disbursement / Bank Account
export interface DisbursementPayload {
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_holder: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Step 1 — Customer menyetujui T&C.
 * Token yang dihasilkan dipakai di Step 2 lalu dibuang.
 */
export async function acceptAgreement(): Promise<AgreementResult> {
  const res = await client.post<ApiResponse<AgreementResult>>(
    '/applications/agree'
  );
  const data = res.data.data;
  // Simpan agreement_token ke sessionStorage untuk dipakai Step 2
  saveAgreementToken(data.agreement_token);
  return data;
}

/**
 * Step 2 — Buat application dan dapatkan session token.
 * Session token disimpan otomatis ke sessionStorage.
 * Semua request Step 3–7 akan otomatis menyertakan token ini via interceptor.
 */
export async function createApplication(
  payload: Omit<CreateApplicationPayload, 'agreement_token'>
): Promise<CreateApplicationResult> {
  // Ambil agreement_token dari Step 1 (one-time consume)
  const agreementToken = consumeAgreementToken();
  if (!agreementToken) {
    throw new Error(
      'Agreement token tidak ditemukan. Silakan mulai dari Step 1.'
    );
  }

  const res = await client.post<ApiResponse<CreateApplicationResult>>(
    '/applications',
    { ...payload, agreement_token: agreementToken }
  );

  const data = res.data.data;

  // Simpan session ke sessionStorage — interceptor akan inject otomatis mulai sekarang
  saveSession({
    applicationId: data.application_id,
    sessionToken:  data.session_token,
    productType:   data.product_type,
    currentStep:   data.current_step,
    expiresAt:     data.expires_at,
  });

  return data;
}

/**
 * Step 3 — Upload KTP dan proses OCR.
 * @param appId       Application ID dari Step 2
 * @param imageBase64 Base64 image KTP (boleh dengan/tanpa data URI prefix)
 * @param filename    Nama file opsional untuk deteksi MIME type
 */
export async function submitOCR(
  appId: string,
  imageBase64: string,
  filename = 'ktp.jpg'
): Promise<OcrResult> {
  const res = await client.post<ApiResponse<OcrResult>>(
    `/applications/${appId}/ocr`,
    { image_base64: imageBase64, filename }
  );
  updateCurrentStep(res.data.data.current_step);
  return res.data.data;
}

/**
 * Step 4 — Update data personal (kontak + pekerjaan + ibu kandung).
 */
export async function updatePersonalInfo(
  appId: string,
  payload: PersonalInfoPayload
): Promise<void> {
  const res = await client.patch<ApiResponse<{ current_step: number }>>(
    `/applications/${appId}/personal-info`,
    payload
  );
  updateCurrentStep(res.data.data.current_step);
}

/**
 * Step 5 (pre) — Ambil VIDA access token dari backend untuk init VIDA Web SDK.
 * Token ini di-forward dari backend ke frontend, lalu dipakai untuk init SDK.
 * Backend yang handle credential VIDA — frontend tidak pegang secret.
 */
export async function getLivenessToken(
  appId: string
): Promise<LivenessTokenResult> {
  const res = await client.get<ApiResponse<LivenessTokenResult>>(
    `/applications/${appId}/liveness/token`
  );
  return res.data.data;
}

/**
 * Step 5 (post) — Submit selfie hasil VIDA Web SDK ke backend.
 * Backend akan call VIDA Fraud Assessment API dengan selfie ini.
 * @param appId         Application ID
 * @param selfieBase64  Selfie image dari hasil VIDA Web SDK
 */
export async function submitLiveness(
  appId: string,
  selfieBase64: string,
  transactionId?: string  // ← TAMBAH parameter ini
): Promise<void> {
  const res = await client.post<ApiResponse<{ current_step: number }>>(
    `/applications/${appId}/liveness`,
    { selfie_base64: selfieBase64, transaction_id: transactionId ?? '' }
  );
  updateCurrentStep(res.data.data.current_step);
}

/**
 * Step 6 — Simpan data rekening bank untuk pencairan/pengembalian.
 */
export async function updateDisbursement(
  appId: string,
  payload: DisbursementPayload
): Promise<void> {
  const res = await client.patch<ApiResponse<{ current_step: number }>>(
    `/applications/${appId}/disbursement`,
    {
        ...payload,
        bank_code: payload.bank_code || payload.bank_name
    }
  );
  updateCurrentStep(res.data.data.current_step);
}

/**
 * Step 7 — Final submit. Setelah ini status jadi PENDING_REVIEW.
 */
export async function submitApplication(appId: string): Promise<void> {
  await client.post(`/applications/${appId}/submit`);
}

/**
 * Ambil data application (untuk resume wizard atau status check).
 */
export async function getApplication(appId: string) {
  const res = await client.get(`/applications/${appId}`);
  return res.data.data;
}