import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { DepositoFormData } from '@/types/domain';
import { DEPOSITO_RATES } from '@/lib/constants';
import { depositoSimulation, formatCurrency } from '@/lib/calc';
import { submitApplication } from '@/lib/api/applicationApi';
import { getApplicationId, clearSession } from '@/lib/session';
import { toast } from 'sonner';

interface SummaryStepProps {
  formData: DepositoFormData;
}

export function SummaryStep({ formData }: SummaryStepProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceNo, setReferenceNo] = useState('');

  const simulation = depositoSimulation(
    formData.info.amount,
    formData.info.tenor,
    DEPOSITO_RATES[formData.info.tenor]
  );

  const handleSubmit = async () => {
    const appId = getApplicationId();
    if (!appId) {
      toast.error('Session tidak ditemukan', { description: 'Silakan mulai ulang pengajuan.' });
      return;
    }

    setSubmitting(true);
    try {
      await submitApplication(appId);
      clearSession();

      // Gunakan 8 karakter pertama dari application ID sebagai nomor referensi
      // setReferenceNo('DEP-' + appId.slice(0, 8).toUpperCase());
      setReferenceNo(appId.toUpperCase());
      setSubmitted(true);

      toast.success(t('common.success'), {
        description: 'Pengajuan deposito berhasil dikirim',
      });
    } catch (error: any) {
      toast.error(t('common.error'), {
        description: error.message || 'Gagal mengirim pengajuan',
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
          <h2 className="text-2xl font-bold text-success">Pengajuan Berhasil!</h2>
          <p className="text-muted-foreground">
            Terima kasih telah mengajukan deposito di BPR Perdana
          </p>
        </div>

        <Card className="p-6 max-w-md mx-auto">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Nomor Referensi</p>
            <p className="text-2xl font-bold text-primary">{referenceNo}</p>
          </div>
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground">
            Simpan nomor referensi ini untuk tracking pengajuan Anda.
            Tim kami akan menghubungi Anda dalam 1-2 hari kerja.
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
        <p className="text-muted-foreground">
          Periksa kembali data Anda sebelum mengirim
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Informasi Penempatan</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jumlah Penempatan</span>
              <span className="font-semibold">{formatCurrency(formData.info.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jangka Waktu</span>
              <span className="font-semibold">{formData.info.tenor} Bulan</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Suku Bunga</span>
              <span className="font-semibold">{DEPOSITO_RATES[formData.info.tenor]}% p.a.</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nilai Jatuh Tempo</span>
              <span className="font-bold text-primary text-lg">
                {formatCurrency(simulation.maturityValue)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Data Pribadi</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">NIK</span>
              <span className="font-medium">{formData.ktpData?.nik}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nama</span>
              <span className="font-medium">{formData.ktpData?.nama}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal Lahir</span>
              <span className="font-medium">{formData.ktpData?.tanggal_lahir}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Rekening Pencairan</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bank</span>
              <span className="font-medium">{formData.bankAccount.bankName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">No. Rekening</span>
              <span className="font-medium">{formData.bankAccount.accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nama Pemilik</span>
              <span className="font-medium">{formData.bankAccount.accountHolderName}</span>
            </div>
          </div>
        </Card>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={submitting}
        size="lg"
        className="w-full"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Mengirim...
          </>
        ) : (
          t('actions.submit')
        )}
      </Button>
    </div>
  );
}