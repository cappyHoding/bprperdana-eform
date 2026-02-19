import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoneyInput } from '@/components/MoneyInput';
import { AdditionalData } from '@/types/domain';
import { OCCUPATIONS, EDUCATION_LEVELS } from '@/lib/constants';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const additionalDataSchema = z.object({
  alamatTinggal: z.string().min(10, 'Alamat minimal 10 karakter').max(200, 'Alamat maksimal 200 karakter'),
  pekerjaan: z.string().min(1, 'Pekerjaan harus dipilih'),
  lamaBekerjaUsaha: z.string().min(1, 'Lama bekerja harus diisi'),
  penghasilanPerbulan: z.number().min(500000, 'Penghasilan minimal Rp 500.000'),
  namaIbuKandung: z.string().min(3, 'Nama ibu kandung minimal 3 karakter').max(100, 'Nama ibu kandung maksimal 100 karakter'),
  pendidikanTerakhir: z.string().min(1, 'Pendidikan terakhir harus dipilih'),
  email: z.string().email('Format email tidak valid').min(1, 'Email harus diisi'),
  nomorHandphone: z.string().min(10, 'Nomor handphone minimal 10 digit').max(15, 'Nomor handphone maksimal 15 digit').regex(/^[0-9]+$/, 'Nomor handphone hanya boleh berisi angka'),
  alamatUsaha: z.string().min(10, 'Alamat usaha/tempat kerja minimal 10 karakter').max(200, 'Alamat maksimal 200 karakter'),
});

interface AdditionalDataStepProps {
  data: AdditionalData;
  onChange: (data: AdditionalData) => void;
}

export function AdditionalDataStep({ data, onChange }: AdditionalDataStepProps) {
  const { t } = useTranslation();

  const form = useForm({
    resolver: zodResolver(additionalDataSchema),
    mode: 'onChange',
    defaultValues: data,
  });

  const formValues = form.watch();

  useEffect(() => {
    const values = form.getValues();
    onChange(values as AdditionalData);
  }, [formValues, form, onChange]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{t('common.additionalData')}</h2>
        <p className="text-muted-foreground">
          Lengkapi data tambahan untuk melanjutkan
        </p>
      </div>

      <Form {...form}>
        <form className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="alamatTinggal"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>
                  {t('common.address')} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Alamat lengkap tempat tinggal saat ini" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pekerjaan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('common.occupation')} <span className="text-destructive">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih pekerjaan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {OCCUPATIONS.map((occupation) => (
                      <SelectItem key={occupation} value={occupation}>
                        {occupation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lamaBekerjaUsaha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('common.workDuration')} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Contoh: 5 tahun" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <Label>
              {t('common.monthlyIncome')} <span className="text-destructive">*</span>
            </Label>
            <MoneyInput
              label=""
              value={form.watch('penghasilanPerbulan')}
              onChange={(value) => form.setValue('penghasilanPerbulan', value, { shouldValidate: true })}
              placeholder="5.000.000"
              min={500000}
              error={form.formState.errors.penghasilanPerbulan?.message}
            />
          </div>

          <FormField
            control={form.control}
            name="namaIbuKandung"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('common.motherName')} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nama ibu kandung sesuai KTP" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pendidikanTerakhir"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('common.lastEducation')} <span className="text-destructive">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih pendidikan terakhir" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EDUCATION_LEVELS.map((education) => (
                      <SelectItem key={education} value={education}>
                        {education}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="email@example.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nomorHandphone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nomor Handphone <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="tel" 
                    placeholder="08123456789"
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alamatUsaha"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>
                  Alamat Usaha/Tempat Kerja <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Alamat lengkap tempat usaha atau tempat kerja" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
