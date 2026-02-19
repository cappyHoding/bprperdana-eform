import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { MoneyInput } from '@/components/MoneyInput';
import { CardSelect } from '@/components/CardSelect';
import { LoanProduct, LoanTenor } from '@/types/domain';
import { LOAN_PRODUCTS, SOURCE_OF_FUNDS, LOAN_PURPOSES } from '@/lib/constants';
import { loanFlat, loanAmortized, formatCurrency } from '@/lib/calc';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LoanInfoStepProps {
  data: {
    product: LoanProduct;
    loanAmount: number;
    loanTenor: LoanTenor;
    purposeOfLoan: string;
    sourceOfFund: string;
  };
  onChange: (data: LoanInfoStepProps['data']) => void;
}

export function LoanInfoStep({ data, onChange }: LoanInfoStepProps) {
  const { t } = useTranslation();

  const productOptions = [
    {
      value: 'KreditModalKerja',
      title: 'Kredit Modal Kerja',
      subtitle: '1.90% per bulan',
      badge: 'Populer',
      details: [
        `Maks Plafon: ${formatCurrency(LOAN_PRODUCTS.KreditModalKerja.max)}`,
        `Jangka Waktu: Hingga ${LOAN_PRODUCTS.KreditModalKerja.maxYears} tahun`,
        `Agunan: ${LOAN_PRODUCTS.KreditModalKerja.collateral}`,
      ],
    },
    {
      value: 'KreditAnekaGuna',
      title: 'Kredit Aneka Guna',
      subtitle: '1.85% per bulan',
      details: [
        `Maks Plafon: ${formatCurrency(LOAN_PRODUCTS.KreditAnekaGuna.max)}`,
        `Jangka Waktu: Hingga ${LOAN_PRODUCTS.KreditAnekaGuna.maxYears} tahun`,
        `Agunan: ${LOAN_PRODUCTS.KreditAnekaGuna.collateral}`,
      ],
    },
  ];

  const selectedProduct = LOAN_PRODUCTS[data.product];
  const flatCalc =
    data.loanAmount > 0 ? loanFlat(data.loanAmount, data.loanTenor, selectedProduct.rateMonthly) : null;
  const amortizedCalc =
    data.loanAmount > 0
      ? loanAmortized(data.loanAmount, data.loanTenor, selectedProduct.rateMonthly * 12)
      : null;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Informasi Pinjaman</h2>
        <p className="text-muted-foreground">Masukkan detail pinjaman yang Anda butuhkan</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label>
            Produk Pinjaman <span className="text-destructive">*</span>
          </Label>
          <CardSelect
            options={productOptions}
            value={data.product}
            onChange={(value) => onChange({ ...data, product: value as LoanProduct })}
            columns={2}
          />
        </div>

        <MoneyInput
          label="Jumlah Pinjaman"
          value={data.loanAmount}
          onChange={(amount) => onChange({ ...data, loanAmount: amount })}
          placeholder="50000000"
          required
          min={1000000}
        />

        <div className="space-y-2">
          <Label htmlFor="tenor">
            Jangka Waktu <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.loanTenor.toString()}
            onValueChange={(value) => onChange({ ...data, loanTenor: parseInt(value) as LoanTenor })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih jangka waktu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6 Bulan</SelectItem>
              <SelectItem value="12">12 Bulan (1 Tahun)</SelectItem>
              <SelectItem value="18">18 Bulan</SelectItem>
              <SelectItem value="24">24 Bulan (2 Tahun)</SelectItem>
              <SelectItem value="36">36 Bulan (3 Tahun)</SelectItem>
              <SelectItem value="48">48 Bulan (4 Tahun)</SelectItem>
              <SelectItem value="60">60 Bulan (5 Tahun)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose">
            Tujuan Pinjaman <span className="text-destructive">*</span>
          </Label>
          <Select value={data.purposeOfLoan} onValueChange={(value) => onChange({ ...data, purposeOfLoan: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih tujuan pinjaman" />
            </SelectTrigger>
            <SelectContent>
              {LOAN_PURPOSES.map((purpose) => (
                <SelectItem key={purpose} value={purpose}>
                  {purpose}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sourceOfFund">
            Sumber Pembayaran <span className="text-destructive">*</span>
          </Label>
          <Select value={data.sourceOfFund} onValueChange={(value) => onChange({ ...data, sourceOfFund: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih sumber pembayaran" />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OF_FUNDS.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {flatCalc && amortizedCalc && (
          <Card className="p-6 bg-gradient-primary text-white">
            <h3 className="text-lg font-semibold mb-4">Simulasi Angsuran</h3>

            <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-lg">
                <p className="text-sm opacity-90 mb-2">Metode Flat (Estimasi)</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm opacity-90">Angsuran/Bulan</span>
                    <span className="font-bold">
                      {formatCurrency(flatCalc.monthlyInstallmentFlat)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm opacity-90">Total Bayar</span>
                    <span className="font-semibold">{formatCurrency(flatCalc.totalPayableFlat)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/10 rounded-lg">
                <p className="text-sm opacity-90 mb-2">Metode Anuitas (Referensi)</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm opacity-90">Angsuran/Bulan</span>
                    <span className="font-bold">
                      {formatCurrency(amortizedCalc.monthlyInstallmentAmortized)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm opacity-90">Total Bayar</span>
                    <span className="font-semibold">
                      {formatCurrency(amortizedCalc.totalPayableAmortized)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs opacity-75 mt-3">
                *Perhitungan ini bersifat estimasi. Angsuran final akan ditentukan oleh bank sesuai
                kebijakan yang berlaku.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
