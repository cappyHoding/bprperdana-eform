import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { TabunganProduct, AdditionalData, BankAccount } from '@/types/domain';
import { KtpOcrData } from '@/types/api';
import { TABUNGAN_PRODUCTS } from '@/lib/constants';
import { formatCurrency } from '@/lib/calc';
import { submitApplication } from '@/lib/api/applicationApi';
import { getApplicationId, clearSession } from '@/lib/session';
import { toast } from 'sonner';

interface TabunganFormData {
  product: TabunganProduct;
  initialDeposit: number;
  sourceOfFund: string;
  purposeOfSaving: string;
  ktpData: KtpOcrData | null;
  additionalData: AdditionalData;
  bankAccount: BankAccount;
}

interface SummaryStepProps {
  formData: TabunganFormData;
  onSubmit: () => void;
  submitting: boolean;
}

const productLabel: Record<TabunganProduct, string> = {
  Perdana: 'Tabungan Perdana',
  PerdanaPlus: 'Tabungan Perdana Plus',
  TabunganKu: 'TabunganKu',
};

export function SummaryStep({ formData, onSubmit, submitting }: SummaryStepProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [referenceNo, setReferenceNo] = useState('');
  const [loading, setLoading] = useState(false);

  const productInfo = TABUNGAN_PRODUCTS[formData.product];

  const handleSubmit = async () => {
    const appId = getApplicationId();
    if (!appId) {
      toast.error('Session tidak ditemukan', { description: 'Silakan mulai ulang pengajuan.' });
      return;
    }

    setLoading(true);
    try {
      await submitApplication(appId);
      clearSession();

      setReferenceNo('TAB-' + appId.slice(0, 8).toUpperCase());
      setSubmitted(true);

      toast.success(t('common.success'), {
        description: 'Pengajuan tabungan berhasil dikirim',
      });
    } catch (error: any) {
      toast.error(t('common.error'), {
        description: error.message || 'Gagal mengirim pengajuan',
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12 text-success" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-success">Pengajuan Berhasil!</h2>
          <p className="text-muted-foreground">
            Terima kasih telah membuka tabungan di BPR Perdana
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

  // ── Summary state ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{t('common.summary')}</h2>
        <p className="text-muted-foreground">Periksa kembali data Anda sebelum mengirim</p>
      </div>

      <div className="space-y-4">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Informasi Tabungan</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Produk</span>
              <span className="font-semibold">{productLabel[formData.product]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Setoran Awal</span>
              <span className="font-semibold">{formatCurrency(formData.initialDeposit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Suku Bunga</span>
              <span className="font-semibold">{productInfo.rate}% p.a.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sumber Dana</span>
              <span className="font-semibold">{formData.sourceOfFund}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tujuan Menabung</span>
              <span className="font-semibold">{formData.purposeOfSaving}</span>
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
          <h3 className="font-semibold text-lg mb-4">Kontak</h3>
          <div className="space-y-3">
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
          <h3 className="font-semibold text-lg mb-4">Rekening Penarikan</h3>
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
        disabled={loading}
        size="lg"
        className="w-full"
      >
        {loading ? (
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