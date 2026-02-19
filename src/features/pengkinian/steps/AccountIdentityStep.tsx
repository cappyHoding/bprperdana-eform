import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const accountIdentitySchema = z.object({
  accountNumber: z.string().min(8, 'Nomor rekening minimal 8 digit').max(20, 'Nomor rekening maksimal 20 digit').regex(/^[0-9]+$/, 'Nomor rekening hanya boleh berisi angka'),
  identityNumber: z.string().length(16, 'NIK harus 16 digit').regex(/^[0-9]+$/, 'NIK hanya boleh berisi angka'),
});

interface AccountIdentityStepProps {
  accountNumber: string;
  identityNumber: string;
  onChange: (data: { accountNumber: string; identityNumber: string }) => void;
}

export function AccountIdentityStep({
  accountNumber,
  identityNumber,
  onChange,
}: AccountIdentityStepProps) {
  const form = useForm({
    resolver: zodResolver(accountIdentitySchema),
    mode: 'onChange',
    defaultValues: {
      accountNumber,
      identityNumber,
    },
  });

  const formValues = form.watch();

  useEffect(() => {
    const values = form.getValues();
    onChange({
      accountNumber: values.accountNumber || '',
      identityNumber: values.identityNumber || '',
    });
  }, [formValues, form, onChange]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Data Rekening & Identitas</h2>
        <p className="text-muted-foreground">
          Masukkan nomor rekening dan NIK untuk verifikasi
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nomor Rekening <span className="text-destructive">*</span>
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
                <FormDescription>
                  Masukkan nomor rekening BPR Perdana yang aktif
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="identityNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  NIK (Nomor Induk Kependudukan) <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="3174012345670001"
                    maxLength={16}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  NIK 16 digit sesuai KTP
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
