import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoneyInput } from '@/components/MoneyInput';
import { CardSelect } from '@/components/CardSelect';
import { DepositoInfo } from '@/types/domain';
import { DEPOSITO_RATES, DEPOSITO_MIN_AMOUNT, SOURCE_OF_FUNDS, PLACEMENT_PURPOSES } from '@/lib/constants';
import { depositoSimulation, formatCurrency } from '@/lib/calc';

interface PlacementInfoStepProps {
  data: DepositoInfo;
  onChange: (data: DepositoInfo) => void;
}

export function PlacementInfoStep({ data, onChange }: PlacementInfoStepProps) {
  const { t } = useTranslation();

  const tenorOptions = [
    {
      value: 1,
      title: `1 ${t('deposito.month')}`,
      subtitle: `${DEPOSITO_RATES[1]}% p.a.`,
      details: [
        'Setoran Minimum: Rp 1.000.000',
        'Bunga dibayar di akhir',
        'Dapat diperpanjang otomatis',
      ],
    },
    {
      value: 3,
      title: `3 ${t('deposito.months')}`,
      subtitle: `${DEPOSITO_RATES[3]}% p.a.`,
      badge: 'Populer',
      details: [
        'Setoran Minimum: Rp 1.000.000',
        'Bunga dibayar setiap bulan atau akhir',
        'Suku bunga kompetitif',
      ],
    },
    {
      value: 6,
      title: `6 ${t('deposito.months')}`,
      subtitle: `${DEPOSITO_RATES[6]}% p.a.`,
      badge: 'Terbaik',
      details: [
        'Setoran Minimum: Rp 1.000.000',
        'Suku bunga tertinggi',
        'Ideal untuk investasi jangka menengah',
      ],
    },
    {
      value: 12,
      title: `12 ${t('deposito.months')}`,
      subtitle: `${DEPOSITO_RATES[12]}% p.a.`,
      details: [
        'Setoran Minimum: Rp 1.000.000',
        'Suku bunga tertinggi',
        'Perencanaan keuangan jangka panjang',
      ],
    },
  ];

  const simulation = data.amount >= DEPOSITO_MIN_AMOUNT 
    ? depositoSimulation(data.amount, data.tenor, DEPOSITO_RATES[data.tenor])
    : null;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{t('deposito.step2')}</h2>
        <p className="text-muted-foreground">
          Masukkan informasi penempatan deposito Anda
        </p>
      </div>

      <div className="space-y-6">
        <MoneyInput
          label={t('deposito.amount')}
          value={data.amount}
          onChange={(amount) => onChange({ ...data, amount })}
          placeholder="1.000.000"
          required
          min={DEPOSITO_MIN_AMOUNT}
        />

        <div className="space-y-3">
          <Label>
            {t('deposito.tenor')} <span className="text-destructive">*</span>
          </Label>
          <CardSelect
            options={tenorOptions}
            value={data.tenor}
            onChange={(tenor) => onChange({ ...data, tenor: tenor as any })}
            columns={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="aroType">
            {t('deposito.aroType')} <span className="text-destructive">*</span>
          </Label>
          <Select value={data.aroType} onValueChange={(value) => onChange({ ...data, aroType: value as any })}>
            <SelectTrigger>
              <SelectValue placeholder={t('deposito.aroTypePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aro">{t('deposito.aroOptions.aro')}</SelectItem>
              <SelectItem value="aroRate">{t('deposito.aroOptions.aroRate')}</SelectItem>
              <SelectItem value="nonAro">{t('deposito.aroOptions.nonAro')}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">{t('deposito.aroTypeHelper')}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sourceOfFund">
            {t('deposito.sourceOfFund')} <span className="text-destructive">*</span>
          </Label>
          <Select value={data.sourceOfFund} onValueChange={(value) => onChange({ ...data, sourceOfFund: value })}>
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
            {t('deposito.purpose')} <span className="text-destructive">*</span>
          </Label>
          <Select value={data.placementPurpose} onValueChange={(value) => onChange({ ...data, placementPurpose: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih tujuan penempatan" />
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
          <Card className="p-6 bg-gradient-primary text-white">
            <h3 className="text-lg font-semibold mb-4">{t('deposito.simulation')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/20">
                <span className="opacity-90">{t('deposito.principal')}</span>
                <span className="font-semibold">{formatCurrency(data.amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">{t('deposito.rate')}</span>
                <span className="font-semibold">{DEPOSITO_RATES[data.tenor]}% p.a.</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">{t('deposito.grossInterest')}</span>
                <span className="font-semibold">{formatCurrency(simulation.grossInterest)}</span>
              </div>
              {simulation.interestTax > 0 && (
                <div className="flex justify-between items-center">
                  <span className="opacity-90">{t('deposito.tax')} (20%)</span>
                  <span className="font-semibold">-{formatCurrency(simulation.interestTax)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-white/20">
                <span className="opacity-90">{t('deposito.netInterest')}</span>
                <span className="font-bold text-lg">{formatCurrency(simulation.netInterest)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t-2 border-white/30">
                <span className="font-semibold">{t('deposito.maturityValue')}</span>
                <span className="font-bold text-xl">{formatCurrency(simulation.maturityValue)}</span>
              </div>
              <div className="mt-4 p-3 bg-white/10 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-90">{t('deposito.earlyWithdrawal')}</span>
                  <span className="font-semibold">{formatCurrency(simulation.earlyWithdrawalValue)}</span>
                </div>
                <p className="text-xs opacity-75 mt-1">*Penalti 10% dari pokok</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
