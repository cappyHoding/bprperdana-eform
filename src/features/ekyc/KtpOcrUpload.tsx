/**
 * KtpOcrUpload.tsx
 *
 * Komponen upload foto KTP dengan OCR processing via backend.
 *
 * PERUBAHAN dari versi lama:
 * - Tambah prop `appId` — dibutuhkan untuk call submitOCR(appId, base64)
 * - OCR tidak lagi call /ekyc/ocr langsung, tapi via /applications/:id/ocr
 *   (yang sudah ter-protect X-Session-Token via interceptor)
 * - Response OCR dari backend (OcrResult) di-map ke KtpOcrData
 */

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Camera, Loader2, CheckCircle2 } from 'lucide-react';
import { KtpOcrData } from '@/types/api';
import { toast } from 'sonner';
import { submitOCR } from '@/lib/api/applicationApi';
import { validateKtpFile, fileToBase64 } from '@/lib/api/ekycApi';

interface KtpOcrUploadProps {
  appId: string;                                              // ← BARU: wajib untuk submitOCR
  onComplete: (data: KtpOcrData, image: string) => void;
  onError?: (error: string) => void;
  initialData?: KtpOcrData | null;
  initialImage?: string | null;
}

export function KtpOcrUpload({
  appId,
  onComplete,
  onError,
  initialData,
  initialImage,
}: KtpOcrUploadProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [ocrData, setOcrData] = useState<KtpOcrData | null>(initialData || null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialImage || null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi file
    const validationError = validateKtpFile(file);
    if (validationError) {
      toast.error(t('common.error'), { description: validationError });
      return;
    }

    // Preview
    const base64 = await fileToBase64(file);
    setImagePreview(base64);

    const base64Pure = base64.includes(',')
    ? base64.split(',')[1]
    : base64;

    // Process OCR
    await processOcr(base64Pure, file.name);

    // Reset input agar file yang sama bisa dipilih ulang
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processOcr = async (base64: string, filename: string) => {
    setLoading(true);
    setError(null);

    try {
      // Call backend /applications/:id/ocr (X-Session-Token otomatis dari interceptor)
      const result = await submitOCR(appId, base64, filename);

      // Map OcrResult (backend format) → KtpOcrData (frontend format)
      const ktpData: KtpOcrData = {
        nik:               result.nik,
        nama:              result.full_name,
        tempat_lahir:      result.birth_place,
        tanggal_lahir:     result.birth_date,
        jenis_kelamin:     result.gender,
        alamat:            result.address,
        rt_rw:             result.rt_rw             ?? '',
        kelurahan_desa:    result.kelurahan          ?? '',
        kecamatan:         result.kecamatan          ?? '',
        kabupaten_kota:    result.kabupaten_kota     ?? '',
        provinsi:          result.provinsi           ?? '',
        agama:             result.agama              ?? '',
        status_perkawinan: result.status_perkawinan  ?? '',
        pekerjaan:         result.pekerjaan          ?? '',
        kewarganegaraan:   result.kewarganegaraan    ?? '',
        berlaku_hingga:    result.berlaku_hingga     ?? '',
      };

      setOcrData(ktpData);
      toast.success('KTP berhasil diverifikasi');
      onComplete(ktpData, base64);
    } catch (err: any) {
      const msg = err.message || 'Gagal memproses KTP';
      setError(msg);
      onError?.(msg);
      toast.error(t('common.error'), { description: msg });
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div className="space-y-2">
        <Label>{t('ekyc.ktpPhoto')}</Label>
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="KTP Preview"
              className="max-h-48 mx-auto rounded object-contain"
            />
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t('ekyc.uploadKtpHint')}
              </p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Memverifikasi KTP...
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* OCR Result */}
      {ocrData && !loading && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            Data KTP berhasil dibaca
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">NIK</Label>
              <Input value={ocrData.nik} readOnly className="bg-muted" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Nama Lengkap</Label>
              <Input value={ocrData.nama} readOnly className="bg-muted" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Tempat Lahir</Label>
              <Input value={ocrData.tempat_lahir} readOnly className="bg-muted" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Tanggal Lahir</Label>
              <Input value={ocrData.tanggal_lahir} readOnly className="bg-muted" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs text-muted-foreground">Alamat</Label>
              <Input value={ocrData.alamat} readOnly className="bg-muted" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Jenis Kelamin</Label>
              <Input value={ocrData.jenis_kelamin} readOnly className="bg-muted" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Kewarganegaraan</Label>
              <Input value={ocrData.kewarganegaraan} readOnly className="bg-muted" />
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <Camera className="w-4 h-4 mr-2" />
            Ganti Foto KTP
          </Button>
        </div>
      )}
    </div>
  );
}