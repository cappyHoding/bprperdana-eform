import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { LoanProduct, LoanTenor, KtpOcrData } from '@/types/domain';
import { LOAN_PRODUCTS } from '@/lib/constants';
import { loanFlat, ltv, formatCurrency } from '@/lib/calc';
import { toast } from 'sonner';

interface PinjamanFormData {
  product: LoanProduct;
  loanAmount: number;
  loanTenor: LoanTenor;
  collateralType: string;
  collateralValue: number;
  ktpData: KtpOcrData | null;
}

interface SummaryStepProps {
  formData: PinjamanFormData;
}

export function SummaryStep({ formData }: SummaryStepProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceNo, setReferenceNo] = useState('');

  const productInfo = LOAN_PRODUCTS[formData.product];
  const simulation = loanFlat(
    formData.loanAmount,
    formData.loanTenor,
    productInfo.rateMonthly
  );
  const ltvValue = ltv(formData.loanAmount, formData.collateralValue);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const refNo = 'KRD' + Date.now().toString().slice(-8);
      setReferenceNo(refNo);
      setSubmitted(true);

      toast.success(t('common.success'), {
        description: 'Pengajuan pinjaman berhasil dikirim',
      });
    } catch (error) {
      toast.error(t('common.error'), {
        description: 'Gagal mengirim pengajuan',
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
          <p className="text-muted-foreground">Terima kasih telah mengajukan pinjaman di BPR Perdana</p>
        </div>

        <Card className="p-6 max-w-md mx-auto">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Nomor Referensi</p>
            <p className="text-2xl font-bold text-primary">{referenceNo}</p>
          </div>
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground">
            Simpan nomor referensi ini untuk tracking pengajuan Anda. Tim kami akan menghubungi Anda
            dalam 2-3 hari kerja untuk proses selanjutnya.
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
        <p className="text-muted-foreground">Periksa kembali data Anda sebelum mengirim</p>
      </div>

      <div className="space-y-4">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Informasi Pinjaman</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Produk</span>
              <span className="font-semibold">
                {formData.product === 'KreditModalKerja' ? 'Kredit Modal Kerja' : 'Kredit Aneka Guna'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jumlah Pinjaman</span>
              <span className="font-semibold">{formatCurrency(formData.loanAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jangka Waktu</span>
              <span className="font-semibold">{formData.loanTenor} Bulan</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Angsuran/Bulan (Est.)</span>
              <span className="font-bold text-primary text-lg">
                {formatCurrency(simulation.monthlyInstallmentFlat)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Informasi Agunan</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jenis Agunan</span>
              <span className="font-medium">{formData.collateralType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nilai Agunan</span>
              <span className="font-medium">{formatCurrency(formData.collateralValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">LTV Ratio</span>
              <span
                className={`font-semibold ${
                  ltvValue > 80 ? 'text-destructive' : ltvValue > 70 ? 'text-yellow-600' : 'text-success'
                }`}
              >
                {ltvValue.toFixed(1)}%
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
              <span className="font-medium">{formData.ktpData?.tanggalLahir}</span>
            </div>
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
          t('actions.submit')
        )}
      </Button>
    </div>
  );
}
