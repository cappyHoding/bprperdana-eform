import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { LoanProduct, LoanTenor, AdditionalData, BankAccount } from '@/types/domain';
import { KtpOcrData } from '@/types/api';
import { LOAN_PRODUCTS } from '@/lib/constants';
import { loanFlat, ltv, formatCurrency } from '@/lib/calc';
import { submitApplication } from '@/lib/api/applicationApi';
import { getApplicationId, clearSession } from '@/lib/session';
import { toast } from 'sonner';

interface PinjamanFormData {
  product: LoanProduct;
  loanAmount: number;
  loanTenor: LoanTenor;
  purposeOfLoan: string;
  sourceOfFund: string;
  collateralType: string;
  collateralValue: number;
  collateralOwnership: string;
  ktpData: KtpOcrData | null;
  additionalData: AdditionalData;
  bankAccount: BankAccount;
}

interface SummaryStepProps {
  formData: PinjamanFormData;
}

const productLabel: Record<LoanProduct, string> = {
  KreditModalKerja: 'Kredit Modal Kerja',
  KreditAnekaGuna: 'Kredit Aneka Guna',
};

export function SummaryStep({ formData }: SummaryStepProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceNo, setReferenceNo] = useState('');

  const productInfo = LOAN_PRODUCTS[formData.product];
  const simulation = loanFlat(formData.loanAmount, formData.loanTenor, productInfo.rateMonthly);
  const ltvValue = ltv(formData.loanAmount, formData.collateralValue);

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
      // setReferenceNo('KRD-' + appId.slice(0, 8).toUpperCase());
      setReferenceNo(appId.toUpperCase());
      setSubmitted(true);
      toast.success(t('common.success'), { description: 'Pengajuan pinjaman berhasil dikirim' });
    } catch (error: any) {
      toast.error(t('common.error'), { description: error.message || 'Gagal mengirim pengajuan' });
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
            Simpan nomor referensi ini untuk tracking pengajuan Anda. Tim kami akan menghubungi
            Anda dalam 2–3 hari kerja untuk proses selanjutnya.
          </p>
        </Card>
        <Button onClick={() => navigate('/')} size="lg">Kembali ke Beranda</Button>
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
              <span className="font-semibold">{productLabel[formData.product]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jumlah Pinjaman</span>
              <span className="font-semibold">{formatCurrency(formData.loanAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jangka Waktu</span>
              <span className="font-semibold">{formData.loanTenor} Bulan</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tujuan Pinjaman</span>
              <span className="font-semibold">{formData.purposeOfLoan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sumber Pembayaran</span>
              <span className="font-semibold">{formData.sourceOfFund}</span>
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
              <span className="text-muted-foreground">Kepemilikan</span>
              <span className="font-medium">{formData.collateralOwnership}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">LTV Ratio</span>
              <span className={`font-semibold ${ltvValue > 80 ? 'text-destructive' : ltvValue > 70 ? 'text-yellow-600' : 'text-success'}`}>
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
              <span className="font-medium">{formData.ktpData?.tanggal_lahir}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{formData.additionalData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">No. HP</span>
              <span className="font-medium">{formData.additionalData.nomorHandphone}</span>
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

      <Button onClick={handleSubmit} disabled={submitting} size="lg" className="w-full">
        {submitting ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Mengirim...</>
        ) : (
          t('actions.submit')
        )}
      </Button>
    </div>
  );
}