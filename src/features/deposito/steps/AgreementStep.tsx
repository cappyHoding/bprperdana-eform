import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AgreementStepProps {
  agreed: boolean;
  onAgree: (agreed: boolean) => void;
}

export function AgreementStep({ agreed, onAgree }: AgreementStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{t('ekyc.agreement')}</h2>
        <p className="text-muted-foreground">
          {t('ekyc.subtitle')}
        </p>
      </div>

      <Card className="p-6">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4 text-sm">
            {/* <h3 className="font-semibold text-lg">
              Syarat dan Ketentuan Verifikasi Identitas Elektronik (eKYC)
            </h3> */}
            
            <div className="space-y-2">
              <h4 className="font-semibold">{t('ekyc.agreements.pengumpulan_data.title')}</h4>
              <p className="text-muted-foreground">
                {t('ekyc.agreements.pengumpulan_data.desc')}
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>{t('ekyc.agreements.pengumpulan_data.items.0')}</li>
                <li>{t('ekyc.agreements.pengumpulan_data.items.1')}</li>
                <li>{t('ekyc.agreements.pengumpulan_data.items.2')}</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">{t('ekyc.agreements.penggunaan_data.title')}</h4>
              <p className="text-muted-foreground">
                {t('ekyc.agreements.penggunaan_data.desc')}
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>{t('ekyc.agreements.penggunaan_data.items.0')}</li>
                <li>{t('ekyc.agreements.penggunaan_data.items.1')}</li>
                <li>{t('ekyc.agreements.penggunaan_data.items.2')}</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">{t('ekyc.agreements.keamanan_data.title')}</h4>
              <p className="text-muted-foreground">
                {t('ekyc.agreements.keamanan_data.desc')}
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>{t('ekyc.agreements.keamanan_data.items.0')}</li>
                <li>{t('ekyc.agreements.keamanan_data.items.1')}</li>
                <li>{t('ekyc.agreements.keamanan_data.items.2')}</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">{t('ekyc.agreements.sertifikat_digital.title')}</h4>
              <p className="text-muted-foreground">
                {t('ekyc.agreements.sertifikat_digital.desc')}
              </p>
              <p className="text-muted-foreground">
                {t('ekyc.agreements.sertifikat_digital.subdesc')}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">{t('ekyc.agreements.hak_nasabah.title')}</h4>
              <p className="text-muted-foreground">
                {t('ekyc.agreements.hak_nasabah.desc')}
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>{t('ekyc.agreements.hak_nasabah.items.0')}</li>
                <li>{t('ekyc.agreements.hak_nasabah.items.1')}</li>
                <li>{t('ekyc.agreements.hak_nasabah.items.2')}</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">{t('ekyc.agreements.persetujuan.title')}</h4>
              <p className="text-muted-foreground">
                {t('ekyc.agreements.persetujuan.desc')}
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>{t('ekyc.agreements.persetujuan.items.0')}</li>
                <li>{t('ekyc.agreements.persetujuan.items.1')}</li>
                <li>{t('ekyc.agreements.persetujuan.items.2')}</li>
                <li>{t('ekyc.agreements.persetujuan.items.3')}</li>
              </ul>
      
            </div>
          </div>
        </ScrollArea>
      </Card>

      <div className="flex items-start space-x-3 p-4 border rounded-lg bg-muted/50">
        <Checkbox
          id="agreement"
          checked={agreed}
          onCheckedChange={(checked) => onAgree(checked as boolean)}
        />
        <div className="flex-1">
          <label
            htmlFor="agreement"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            {t('ekyc.agreementText')}
          </label>
        </div>
      </div>
    </div>
  );
}
