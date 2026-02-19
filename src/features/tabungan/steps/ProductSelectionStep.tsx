import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoneyInput } from '@/components/MoneyInput';
import { CardSelect } from '@/components/CardSelect';
import { TabunganProduct } from '@/types/domain';
import { TABUNGAN_PRODUCTS, SOURCE_OF_FUNDS, PLACEMENT_PURPOSES } from '@/lib/constants';
import { tabunganMonthly, formatCurrency } from '@/lib/calc';

interface ProductSelectionStepProps {
  product: TabunganProduct;
  initialDeposit: number;
  sourceOfFund: string;
  purposeOfSaving: string;
  onChange: (data: {
    product: TabunganProduct;
    initialDeposit: number;
    sourceOfFund: string;
    purposeOfSaving: string;
  }) => void;
}

export function ProductSelectionStep({
  product,
  initialDeposit,
  sourceOfFund,
  purposeOfSaving,
  onChange,
}: ProductSelectionStepProps) {
  const { t } = useTranslation();

  const productOptions = [
    {
      value: 'Perdana',
      title: 'Tabungan Perdana',
      subtitle: '0% Bunga',
      details: [
        `Setoran Pertama: ${formatCurrency(TABUNGAN_PRODUCTS.Perdana.minFirst)}`,
        `Setoran Selanjutnya: Min ${formatCurrency(TABUNGAN_PRODUCTS.Perdana.minNext)}`,
        `Saldo Mengendap: Min ${formatCurrency(TABUNGAN_PRODUCTS.Perdana.holdMin)}`,
        `Biaya Tutup: ${formatCurrency(TABUNGAN_PRODUCTS.Perdana.closeFee)}`,
      ],
    },
    {
      value: 'PerdanaPlus',
      title: 'Tabungan Perdana Plus',
      subtitle: '0.2% Bunga p.a.',
      badge: 'Populer',
      details: [
        `Setoran Pertama: ${formatCurrency(TABUNGAN_PRODUCTS.PerdanaPlus.minFirst)}`,
        `Setoran Selanjutnya: Min ${formatCurrency(TABUNGAN_PRODUCTS.PerdanaPlus.minNext)}`,
        `Program Undian: ${TABUNGAN_PRODUCTS.PerdanaPlus.points}`,
        `Biaya Tutup: ${formatCurrency(TABUNGAN_PRODUCTS.PerdanaPlus.closeFee)}`,
      ],
    },
    {
      value: 'TabunganKu',
      title: 'TabunganKu',
      subtitle: '0.1% Bunga p.a.',
      details: [
        `Setoran Pertama: ${formatCurrency(TABUNGAN_PRODUCTS.TabunganKu.minFirst)}`,
        `Setoran Selanjutnya: Min ${formatCurrency(TABUNGAN_PRODUCTS.TabunganKu.minNext)}`,
        `Saldo Mengendap: Min ${formatCurrency(TABUNGAN_PRODUCTS.TabunganKu.holdMin)}`,
        `Biaya Tutup: ${formatCurrency(TABUNGAN_PRODUCTS.TabunganKu.closeFee)}`,
      ],
    },
  ];

  const selectedProduct = TABUNGAN_PRODUCTS[product];
  const simulation =
    initialDeposit >= selectedProduct.minFirst
      ? tabunganMonthly(initialDeposit, selectedProduct.rate)
      : null;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Pilih Produk Tabungan</h2>
        <p className="text-muted-foreground">
          Pilih produk tabungan yang sesuai dengan kebutuhan Anda
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label>
            Produk Tabungan <span className="text-destructive">*</span>
          </Label>
          <CardSelect
            options={productOptions}
            value={product}
            onChange={(value) =>
              onChange({
                product: value as TabunganProduct,
                initialDeposit,
                sourceOfFund,
                purposeOfSaving,
              })
            }
            columns={3}
          />
        </div>

        <MoneyInput
          label="Setoran Awal"
          value={initialDeposit}
          onChange={(amount) =>
            onChange({ product, initialDeposit: amount, sourceOfFund, purposeOfSaving })
          }
          placeholder={selectedProduct.minFirst.toString()}
          required
          min={selectedProduct.minFirst}
        />

        <div className="space-y-2">
          <Label htmlFor="sourceOfFund">
            Sumber Dana <span className="text-destructive">*</span>
          </Label>
          <Select value={sourceOfFund} onValueChange={(value) => onChange({ product, initialDeposit, sourceOfFund: value, purposeOfSaving })}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih sumber dana" />
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

        <div className="space-y-2">
          <Label htmlFor="purpose">
            Tujuan Menabung <span className="text-destructive">*</span>
          </Label>
          <Select value={purposeOfSaving} onValueChange={(value) => onChange({ product, initialDeposit, sourceOfFund, purposeOfSaving: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih tujuan menabung" />
            </SelectTrigger>
            <SelectContent>
              {PLACEMENT_PURPOSES.map((purpose) => (
                <SelectItem key={purpose} value={purpose}>
                  {purpose}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {simulation && (
          <Card className="p-6 bg-gradient-secondary text-white">
            <h3 className="text-lg font-semibold mb-4">Proyeksi Bulan Pertama</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/20">
                <span className="opacity-90">Saldo Awal</span>
                <span className="font-semibold">{formatCurrency(initialDeposit)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Bunga Bulanan</span>
                <span className="font-semibold">{formatCurrency(simulation.monthlyInterest)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t-2 border-white/30">
                <span className="font-semibold">Proyeksi Saldo (1 Bulan)</span>
                <span className="font-bold text-xl">
                  {formatCurrency(simulation.projectedBalanceMonth1)}
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
