import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { KtpOcrData } from '@/types/domain';
import { toast } from 'sonner';

interface PengkinianFormData {
  accountNumber: string;
  identityNumber: string;
  ktpData: KtpOcrData | null;
  updatedData: {
    nama: string;
    alamat: string;
    pekerjaan: string;
    phone: string;
    email: string;
  };
}

interface SummaryStepProps {
  formData: PengkinianFormData;
}

export function SummaryStep({ formData }: SummaryStepProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceNo, setReferenceNo] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const refNo = 'UPD' + Date.now().toString().slice(-8);
      setReferenceNo(refNo);
      setSubmitted(true);

      toast.success(t('common.success'), {
        description: 'Pengkinian data berhasil dikirim',
      });
    } catch (error) {
      toast.error(t('common.error'), {
        description: 'Gagal mengirim pengkinian data',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12 text-success" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-success">Pengkinian Data Berhasil!</h2>
          <p className="text-muted-foreground">Data Anda telah berhasil diperbarui</p>
        </div>

        <Card className="p-6 max-w-md mx-auto">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Nomor Referensi</p>
            <p className="text-2xl font-bold text-success">{referenceNo}</p>
          </div>
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground">
            Simpan nomor referensi ini. Data yang diperbarui akan diproses dalam 1 hari kerja.
          </p>
        </Card>

        <Button onClick={() => navigate('/')} size="lg">
          Kembali ke Beranda
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{t('common.summary')}</h2>
        <p className="text-muted-foreground">Periksa kembali data yang akan diperbarui</p>
      </div>

      <div className="space-y-4">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Informasi Rekening</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nomor Rekening</span>
              <span className="font-medium">{formData.accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">NIK</span>
              <span className="font-medium">{formData.identityNumber}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Data yang Diperbarui</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Nama Lengkap</p>
              <p className="font-medium">{formData.updatedData.nama}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Alamat</p>
              <p className="font-medium">{formData.updatedData.alamat}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Pekerjaan</p>
              <p className="font-medium">{formData.updatedData.pekerjaan}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Nomor Telepon</p>
              <p className="font-medium">{formData.updatedData.phone}</p>
            </div>
            {formData.updatedData.email && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{formData.updatedData.email}</p>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <Button onClick={handleSubmit} disabled={submitting} size="lg" className="w-full">
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Mengirim...
          </>
        ) : (
          'Konfirmasi & Kirim'
        )}
      </Button>
    </div>
  );
}
