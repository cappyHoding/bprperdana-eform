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
import {ocrApi} from "@/lib/api.ts";

interface KtpOcrUploadProps {
  onComplete: (data: KtpOcrData, image: string) => void;
  onError?: (error: string) => void;
  initialData?: KtpOcrData | null;
  initialImage?: string | null;
}

export function KtpOcrUpload({ onComplete, onError, initialData, initialImage }: KtpOcrUploadProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [ocrData, setOcrData] = useState<KtpOcrData | null>(initialData || null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialImage || null);
  const [Error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('common.error'), {
        description: 'File harus berupa gambar (JPG, PNG, dll)',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('common.error'), {
        description: 'Ukuran file maksimal 5MB',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      await processOcr(file);
    };
    reader.readAsDataURL(file);
  };

  const processOcr = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Processing OCR...');
      const response = await ocrApi.processKtp(file)
      // // Mock OCR response for demo
      // await new Promise(resolve => setTimeout(resolve, 1500));
      //
      // const mockData: KtpOcrData = {
      //   nik: '3174012345670001',
      //   nama: 'BUDI SANTOSO',
      //   tanggalLahir: '1990-01-15',
      //   alamat: 'JL. MERDEKA NO. 123, RT 001/RW 005',
      //   jenisKelamin: 'LAKI-LAKI',
      //   agama: 'ISLAM',
      //   statusPerkawinan: 'BELUM KAWIN',
      //   pekerjaan: 'KARYAWAN SWASTA',
      // };
      if (response.success && response.data) {
        setOcrData(response.data.data);
        toast.success(t('common.success'), {
          description: 'Data KTP berhasil diekstrak',
        });
      } else {
        const errorMsg = response.message || 'OCR gagal diproses';
        setError(errorMsg);

        toast.error(t('common.error'), {
          description: errorMsg,
        });

        onError?.(errorMsg);
      }
      // setOcrData(mockData);
      // toast.success(t('common.success'), {
      //   description: t('ekyc.ktpUpload') + ' ' + t('common.success').toLowerCase(),
      // });
    } catch (error) {
      toast.error(t('common.error'), {
        description: 'Failed to process KTP image',
      });
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = () => {
    if (!ocrData || !imagePreview) return false;
    return (
      ocrData.nik &&
      ocrData.nama &&
      ocrData.tanggal_lahir &&
      ocrData.alamat
    );
  };

  const handleConfirm = () => {
    if (ocrData && imagePreview && canSubmit()) {
      onComplete(ocrData, imagePreview);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setOcrData(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 1. Helper function to convert DD-MM-YYYY to YYYY-MM-DD
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ""; // Handle empty values

    // If the date is already in YYYY-MM-DD format, return it as is
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }

    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }

    return dateString; // Fallback
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{t('ekyc.ktpUpload')}</h2>
        <p className="text-muted-foreground">{t('ekyc.ktpUploadDesc')}</p>
      </div>

      {!imagePreview ? (
        <Card className="p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-12 h-12 text-primary" />
            </div>
            
            <div className="text-center space-y-2">
              <p className="font-medium">{t('actions.upload')} KTP</p>
              <p className="text-sm text-muted-foreground">
                JPG, PNG atau PDF (Max 5MB)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                {t('actions.upload')}
              </Button>
              
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-4 h-4 mr-2" />
                {t('actions.capture')}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="p-4">
            <img
              src={imagePreview}
              alt="KTP Preview"
              className="w-full h-auto rounded-lg"
            />
            {!loading && !ocrData && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setImagePreview(null);
                  setOcrData(null);
                }}
              >
                {t('actions.change')}
              </Button>
            )}
          </Card>

          {loading && (
            <Card className="p-6">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-muted-foreground">{t('common.loading')}</span>
              </div>
            </Card>
          )}

          {ocrData && (
            <Card className="p-6 space-y-6">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Data berhasil diproses - Silakan periksa dan lengkapi</span>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Data KTP</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nik">
                      {t('ekyc.nik')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="nik"
                        value={ocrData.nik}
                        onChange={(e) => setOcrData({...ocrData, nik: e.target.value})}
                        required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nama">
                      {t('ekyc.nama')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="nama"
                        value={ocrData.nama}
                        onChange={(e) => setOcrData({...ocrData, nama: e.target.value})}
                        required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tempat_lahir">
                      Tempat Lahir <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="tempat_lahir"
                        value={ocrData.tempat_lahir}
                        onChange={(e) => setOcrData({...ocrData, tempat_lahir: e.target.value})}
                        placeholder="Kota tempat lahir"
                        required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tanggalLahir">
                      {t('ekyc.tanggalLahir')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="tanggalLahir"
                        type="date"
                        value={formatDateForInput(ocrData.tanggal_lahir)}
                        onChange={(e) => setOcrData({...ocrData, tanggal_lahir: e.target.value})}
                        required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jenisKelamin">
                      {t('ekyc.jenisKelamin')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="jenisKelamin"
                        value={ocrData.jenis_kelamin}
                        onChange={(e) => setOcrData({...ocrData, jenis_kelamin: e.target.value})}
                        required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agama">{t('ekyc.agama')}</Label>
                    <Input
                        id="agama"
                        value={ocrData.agama}
                        onChange={(e) => setOcrData({...ocrData, agama: e.target.value})}
                        placeholder="Agama"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status_perkawinan">
                      {t('ekyc.statusPerkawinan')}
                    </Label>
                    <Input
                        id="status_perkawinan"
                        value={ocrData.status_perkawinan}
                        onChange={(e) => setOcrData({...ocrData, status_perkawinan: e.target.value})}
                        placeholder="Status Perkawinan"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kewarganegaraan">Kewarganegaraan</Label>
                    <Input
                        id="kewarganegaraan"
                        value={ocrData.kewarganegaraan}
                        onChange={(e) => setOcrData({...ocrData, kewarganegaraan: e.target.value})}
                        placeholder="WNI / WNA"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="alamatKtp">
                      {t('ekyc.alamat')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="alamatKtp"
                        value={ocrData.alamat}
                        onChange={(e) => setOcrData({...ocrData, alamat: e.target.value})}
                        placeholder="Alamat sesuai KTP"
                        required
                    />
                  </div>
                </div>
              </div>

              <Button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!canSubmit()}
                  className="w-full"
              >
                {t('actions.confirm')}
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
