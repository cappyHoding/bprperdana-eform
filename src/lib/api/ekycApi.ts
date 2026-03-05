/**
 * ekycApi.ts
 *
 * Utility untuk proses eKYC di sisi frontend sebelum kirim ke backend.
 *
 * CATATAN ARSITEKTUR:
 * - OCR dan liveness TIDAK lagi dipanggil via endpoint /ekyc/*
 * - Semua sudah diintegrasikan ke /applications/:id/* flow
 * - File ini hanya menyediakan helper untuk konversi file → base64
 *   yang dipakai oleh KtpOcrUpload component sebelum kirim ke submitOCR()
 */

/**
 * Konversi File object ke base64 string (tanpa data URI prefix).
 * Backend menerima base64 murni atau dengan prefix — keduanya di-handle.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Gagal membaca file'));
        return;
      }
      // Kirim dengan data URI prefix agar VIDA OCR bisa deteksi MIME type
      resolve(result);
    };

    reader.onerror = () => reject(new Error('Error membaca file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validasi file KTP sebelum upload.
 * Returns error message atau null jika valid.
 */
export function validateKtpFile(file: File): string | null {
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_SIZE_MB = 5;

  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Format file harus JPG, PNG, atau WEBP';
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `Ukuran file maksimal ${MAX_SIZE_MB}MB`;
  }

  return null;
}