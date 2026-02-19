import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoneyInput } from '@/components/MoneyInput';
import { Upload, X } from 'lucide-react';
import { ltv, formatCurrency } from '@/lib/calc';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CollateralStepProps {
  data: {
    type: string;
    value: number;
    ownership: string;
    description: string;
    images: string[];
  };
  loanAmount: number;
  onChange: (data: CollateralStepProps['data']) => void;
}

export function CollateralStep({ data, loanAmount, onChange }: CollateralStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ltvValue = data.value > 0 && loanAmount > 0 ? ltv(loanAmount, data.value) : 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const readers = Array.from(files).map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((images) => {
      onChange({ ...data, images: [...data.images, ...images] });
    });
  };

  const removeImage = (index: number) => {
    const newImages = data.images.filter((_, i) => i !== index);
    onChange({ ...data, images: newImages });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Informasi Agunan</h2>
        <p className="text-muted-foreground">Masukkan detail agunan untuk pinjaman Anda</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="collateralType">
            Jenis Agunan <span className="text-destructive">*</span>
          </Label>
          <Select value={data.type} onValueChange={(value) => onChange({ ...data, type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenis agunan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SHM">SHM (Sertifikat Hak Milik)</SelectItem>
              <SelectItem value="SHGB">SHGB (Sertifikat Hak Guna Bangunan)</SelectItem>
              <SelectItem value="BPKB">BPKB Kendaraan</SelectItem>
              <SelectItem value="Lainnya">Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <MoneyInput
          label="Nilai Agunan"
          value={data.value}
          onChange={(value) => onChange({ ...data, value })}
          placeholder="100000000"
          required
          min={0}
        />

        <div className="space-y-2">
          <Label htmlFor="ownership">
            Status Kepemilikan <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.ownership}
            onValueChange={(value) => onChange({ ...data, ownership: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih status kepemilikan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Milik Sendiri">Milik Sendiri</SelectItem>
              <SelectItem value="Milik Pasangan">Milik Pasangan</SelectItem>
              <SelectItem value="Milik Orang Tua">Milik Orang Tua</SelectItem>
              <SelectItem value="Lainnya">Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi Agunan (Opsional)</Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            placeholder="Contoh: Tanah seluas 200m2 di Jl. Merdeka"
          />
        </div>

        <div className="space-y-3">
          <Label>
            Foto Agunan & Sertifikat <span className="text-destructive">*</span>
          </Label>

          {data.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {data.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Agunan ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {data.images.length > 0 ? 'Tambah Foto Lainnya' : 'Unggah Foto Agunan'}
          </Button>
          <p className="text-xs text-muted-foreground">
            Unggah foto agunan, sertifikat, atau dokumen pendukung lainnya
          </p>
        </div>

        {ltvValue > 0 && (
          <Card className="p-6 bg-muted">
            <h3 className="font-semibold mb-3">Loan to Value (LTV)</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jumlah Pinjaman</span>
                <span className="font-semibold">{formatCurrency(loanAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nilai Agunan</span>
                <span className="font-semibold">{formatCurrency(data.value)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold">LTV Ratio</span>
                <span
                  className={`font-bold text-lg ${
                    ltvValue > 80 ? 'text-destructive' : ltvValue > 70 ? 'text-yellow-600' : 'text-success'
                  }`}
                >
                  {ltvValue.toFixed(1)}%
                </span>
              </div>
              {ltvValue > 80 && (
                <p className="text-sm text-destructive">
                  ⚠️ LTV tinggi. Nilai agunan sebaiknya minimal {formatCurrency(loanAmount * 1.25)}
                </p>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
