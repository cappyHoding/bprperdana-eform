

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string
  error?: string;
}

// ========== OCR API Types ==========

export interface KtpOcrData {
  nik: string;
  nama: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  alamat: string;
  rt_rw: string;
  kelurahan_desa: string;
  kecamatan: string;
  kabupaten_kota: string;
  provinsi: string;
  agama: string;
  status_perkawinan: string;
  pekerjaan: string;
  kewarganegaraan: string;
  berlaku_hingga: string;
}

export interface OcrApiResponse extends ApiResponse<KtpOcrData> {}


// ========== VIDA API Types ==========

export interface VidaTokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: string;
}

export interface VidaTokenResponse extends ApiResponse<VidaTokenData> {
  success: boolean;
  message: string;
  data: VidaTokenData;
}

export interface VidaLivenessSubmitData {
  selfieImage: string;
  code: number;
  imgManipulationScore: number;
  liveImage: boolean;
  message: string;
  score?: number;
  transactionId?: string;
  perdanaTransactionId?: string;
}

export interface VidaLivenessVerifyData {
  ktpImage: string;
  selfieImage: string;
}

export interface VidaLivenessVerifyResult {
  match: boolean;
  similarity: number;
  livenessValid: boolean;
}


export interface FormSubmitResponse extends ApiResponse<{
  submissionId: string;
  status: string;
  createdAt: string;
}> {}
