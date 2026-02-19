import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BankAccount } from '@/types/domain';
import { INDONESIAN_BANKS } from '@/lib/constants';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const bankAccountSchema = z.object({
  bankName: z.string().min(1, 'Bank harus dipilih'),
  accountNumber: z.string().min(8, 'Nomor rekening minimal 8 digit').max(20, 'Nomor rekening maksimal 20 digit').regex(/^[0-9]+$/, 'Nomor rekening hanya boleh berisi angka'),
  accountHolderName: z.string().min(3, 'Nama pemilik rekening minimal 3 karakter').max(100, 'Nama pemilik rekening maksimal 100 karakter'),
});

interface BankAccountStepProps {
  data: BankAccount;
  onChange: (data: BankAccount) => void;
}

export function BankAccountStep({ data, onChange }: BankAccountStepProps) {
  const { t } = useTranslation();

  const form = useForm({
    resolver: zodResolver(bankAccountSchema),
    mode: 'onChange',
    defaultValues: data,
  });

  const formValues = form.watch();

  useEffect(() => {
    const values = form.getValues();
    onChange(values as BankAccount);
  }, [formValues, form, onChange]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{t('deposito.step6')}</h2>
        <p className="text-muted-foreground">
          Masukkan rekening untuk pencairan deposito
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="bankName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('common.bankName')} <span className="text-destructive">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bank" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INDONESIAN_BANKS.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
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
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('common.accountNumber')} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="1234567890"
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
            name="accountHolderName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('common.accountHolder')} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nama sesuai rekening bank" />
                </FormControl>
                <FormDescription>
                  Pastikan nama sesuai dengan pemilik rekening
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
