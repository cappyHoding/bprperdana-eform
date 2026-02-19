import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const updateDataSchema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter').max(100, 'Nama maksimal 100 karakter'),
  alamat: z.string().min(10, 'Alamat minimal 10 karakter').max(200, 'Alamat maksimal 200 karakter'),
  pekerjaan: z.string().min(3, 'Pekerjaan minimal 3 karakter').max(100, 'Pekerjaan maksimal 100 karakter'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit').max(15, 'Nomor telepon maksimal 15 digit').regex(/^[0-9]+$/, 'Nomor telepon hanya boleh berisi angka'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
});

interface UpdateDataStepProps {
  data: {
    nama: string;
    alamat: string;
    pekerjaan: string;
    phone: string;
    email: string;
  };
  onChange: (data: UpdateDataStepProps['data']) => void;
}

export function UpdateDataStep({ data, onChange }: UpdateDataStepProps) {
  const form = useForm({
    resolver: zodResolver(updateDataSchema),
    mode: 'onChange',
    defaultValues: data,
  });

  const formValues = form.watch();

  useEffect(() => {
    const values = form.getValues();
    onChange({
      nama: values.nama || '',
      alamat: values.alamat || '',
      pekerjaan: values.pekerjaan || '',
      phone: values.phone || '',
      email: values.email || '',
    });
  }, [formValues, form, onChange]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Update Data Pribadi</h2>
        <p className="text-muted-foreground">
          Data di bawah telah diisi otomatis dari KTP. Silakan periksa dan perbarui jika ada perubahan.
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="nama"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nama Lengkap <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nama sesuai KTP" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alamat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Alamat Lengkap <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Alamat lengkap tempat tinggal saat ini" rows={3} />
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
                  Pekerjaan <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Contoh: Karyawan Swasta, Wiraswasta" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nomor Telepon <span className="text-destructive">*</span>
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (Opsional)</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="email@example.com" />
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
