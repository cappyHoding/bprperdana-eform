import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Camera, Loader2, CheckCircle2 } from 'lucide-react';
import { KtpOcrData } from '@/types/domain';
import { toast } from 'sonner';

interface UpdatedData {
  nama: string;
  alamat: string;
  pekerjaan: string;
  phone: string;
  email: string;
}

interface KtpOcrUploadPengkinianProps {
  onComplete: (data: KtpOcrData, updatedData: UpdatedData, image: string) => void;
  initialData?: KtpOcrData | null;
  initialUpdatedData?: UpdatedData | null;
  initialImage?: string | null;
}

export function KtpOcrUploadPengkinian({ onComplete, initialData, initialUpdatedData, initialImage }: KtpOcrUploadPengkinianProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [ocrData, setOcrData] = useState<KtpOcrData | null>(initialData || null);
  const [updatedData, setUpdatedData] = useState<UpdatedData>(
    initialUpdatedData || {
      nama: '',
      alamat: '',
      pekerjaan: '',
      phone: '',
      email: '',
    }
  );
  const [imagePreview, setImagePreview] = useState<string | null>(initialImage || null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      await processOcr(base64);
    };
    reader.readAsDataURL(file);
  };

  const processOcr = async (base64Image: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData: KtpOcrData = {
        nik: '3174012345670001',
        nama: 'BUDI SANTOSO',
        tanggalLahir: '1990-01-15',
        alamat: 'JL. MERDEKA NO. 123, RT 001/RW 005',
        jenisKelamin: 'LAKI-LAKI',
        agama: 'ISLAM',
        statusPerkawinan: 'BELUM KAWIN',
        pekerjaan: 'KARYAWAN SWASTA',
      };
      
      setOcrData(mockData);
      setUpdatedData({
        nama: mockData.nama,
        alamat: mockData.alamat,
        pekerjaan: mockData.pekerjaan || '',
        phone: '',
        email: '',
      });
      
      toast.success(t('common.success'), {
        description: t('ekyc.ktpUpload') + ' ' + t('common.success').toLowerCase(),
      });
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
      ocrData.tanggalLahir &&
      ocrData.alamat &&
      updatedData.nama &&
      updatedData.alamat &&
      updatedData.pekerjaan &&
      updatedData.phone
    );
  };

  const handleConfirm = () => {
    if (ocrData && imagePreview && canSubmit()) {
      onComplete(ocrData, updatedData, imagePreview);
    }
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
                      onChange={(e) => setOcrData({ ...ocrData, nik: e.target.value })}
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
                      onChange={(e) => setOcrData({ ...ocrData, nama: e.target.value })}
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
                      value={ocrData.tanggalLahir}
                      onChange={(e) => setOcrData({ ...ocrData, tanggalLahir: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jenisKelamin">
                      {t('ekyc.jenisKelamin')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="jenisKelamin"
                      value={ocrData.jenisKelamin}
                      onChange={(e) => setOcrData({ ...ocrData, jenisKelamin: e.target.value })}
                      required
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="alamatKtp">
                      {t('ekyc.alamat')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="alamatKtp"
                      value={ocrData.alamat}
                      onChange={(e) => setOcrData({ ...ocrData, alamat: e.target.value })}
                      placeholder="Alamat sesuai KTP"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-lg">Update Data Pribadi</h3>
                <p className="text-sm text-muted-foreground">
                  Data di bawah telah diisi otomatis dari KTP. Silakan periksa dan perbarui jika ada perubahan.
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="updatedNama">
                      Nama Lengkap <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="updatedNama"
                      value={updatedData.nama}
                      onChange={(e) => setUpdatedData({ ...updatedData, nama: e.target.value })}
                      placeholder="Nama sesuai KTP"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="updatedAlamat">
                      Alamat Lengkap <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="updatedAlamat"
                      value={updatedData.alamat}
                      onChange={(e) => setUpdatedData({ ...updatedData, alamat: e.target.value })}
                      placeholder="Alamat lengkap tempat tinggal saat ini"
                      required
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="updatedPekerjaan">
                      Pekerjaan <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="updatedPekerjaan"
                      value={updatedData.pekerjaan}
                      onChange={(e) => setUpdatedData({ ...updatedData, pekerjaan: e.target.value })}
                      placeholder="Contoh: Karyawan Swasta, Wiraswasta"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Nomor Telepon <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={updatedData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setUpdatedData({ ...updatedData, phone: value });
                      }}
                      placeholder="08123456789"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Opsional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={updatedData.email}
                      onChange={(e) => setUpdatedData({ ...updatedData, email: e.target.value })}
                      placeholder="email@example.com"
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
