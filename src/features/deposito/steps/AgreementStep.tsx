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
          Silakan baca dan setujui syarat & ketentuan eKYC
        </p>
      </div>

      <Card className="p-6">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4 text-sm">
            <h3 className="font-semibold text-lg">
              Syarat dan Ketentuan Verifikasi Identitas Elektronik (eKYC)
            </h3>
            
            <div className="space-y-2">
              <h4 className="font-semibold">1. Pengumpulan Data</h4>
              <p className="text-muted-foreground">
                Dengan menggunakan layanan ini, Anda menyetujui bahwa BPR Perdana akan mengumpulkan:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Foto KTP (Kartu Tanda Penduduk)</li>
                <li>Foto selfie untuk verifikasi kesesuaian wajah</li>
                <li>Data pribadi yang tercantum dalam KTP</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">2. Penggunaan Data</h4>
              <p className="text-muted-foreground">
                Data yang dikumpulkan akan digunakan untuk:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Verifikasi identitas nasabah</li>
                <li>Kepatuhan terhadap peraturan Know Your Customer (KYC)</li>
                <li>Pencegahan fraud dan keamanan transaksi</li>
                <li>Proses pembukaan rekening dan layanan perbankan</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">3. Keamanan Data</h4>
              <p className="text-muted-foreground">
                BPR Perdana berkomitmen untuk melindungi data pribadi Anda dengan:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Enkripsi data end-to-end</li>
                <li>Penyimpanan data di server yang aman</li>
                <li>Akses terbatas hanya untuk petugas yang berwenang</li>
                <li>Kepatuhan terhadap regulasi perlindungan data pribadi</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">4. Hak Nasabah</h4>
              <p className="text-muted-foreground">
                Anda memiliki hak untuk:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Mengakses data pribadi yang tersimpan</li>
                <li>Meminta koreksi data yang tidak akurat</li>
                <li>Meminta penghapusan data sesuai ketentuan yang berlaku</li>
                <li>Mencabut persetujuan kapan saja</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">5. Persetujuan</h4>
              <p className="text-muted-foreground">
                Dengan mencentang kotak persetujuan di bawah, Anda menyatakan bahwa:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Anda telah membaca dan memahami syarat dan ketentuan ini</li>
                <li>Anda memberikan persetujuan untuk pemrosesan data pribadi Anda</li>
                <li>Data yang Anda berikan adalah benar dan akurat</li>
                <li>Anda berusia minimal 17 tahun atau telah memiliki KTP yang sah</li>
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
