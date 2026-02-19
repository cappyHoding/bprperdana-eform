import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { TabunganProduct, AdditionalData, BankAccount, KtpOcrData } from '@/types/domain';
import { TABUNGAN_PRODUCTS } from '@/lib/constants';
import { formatCurrency } from '@/lib/calc';
import { toast } from 'sonner';

interface TabunganFormData {
  product: TabunganProduct;
  initialDeposit: number;
  ktpData: KtpOcrData | null;
  bankAccount: BankAccount;
}

interface SummaryStepProps {
  formData: TabunganFormData;
}

export function SummaryStep({ formData }: SummaryStepProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceNo, setReferenceNo] = useState('');

  const productInfo = TABUNGAN_PRODUCTS[formData.product];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const refNo = 'TAB' + Date.now().toString().slice(-8);
      setReferenceNo(refNo);
      setSubmitted(true);

      toast.success(t('common.success'), {
        description: 'Pengajuan tabungan berhasil dikirim',
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
          <p className="text-muted-foreground">Terima kasih telah membuka tabungan di BPR Perdana</p>
        </div>

        <Card className="p-6 max-w-md mx-auto">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Nomor Referensi</p>
            <p className="text-2xl font-bold text-secondary">{referenceNo}</p>
          </div>
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground">
            Simpan nomor referensi ini untuk tracking pengajuan Anda. Tim kami akan menghubungi Anda
            dalam 1-2 hari kerja.
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
          <h3 className="font-semibold text-lg mb-4">Informasi Tabungan</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Produk</span>
              <span className="font-semibold">
                {formData.product === 'Perdana'
                  ? 'Tabungan Perdana'
                  : formData.product === 'PerdanaPlus'
                  ? 'Tabungan Perdana Plus'
                  : 'TabunganKu'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Setoran Awal</span>
              <span className="font-semibold">{formatCurrency(formData.initialDeposit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Suku Bunga</span>
              <span className="font-semibold">{productInfo.rate}% p.a.</span>
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
