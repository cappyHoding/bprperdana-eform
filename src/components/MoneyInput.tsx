import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatNumber } from '@/lib/calc';

interface MoneyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  required?: boolean;
  min?: number;
  error?: string;
}

export function MoneyInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  min,
  error,
}: MoneyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    onChange(Number(rawValue));
  };

  const displayValue = value > 0 ? formatNumber(value) : '';

  return (
    <div className="space-y-2">
      <Label htmlFor={label}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          Rp
        </span>
        <Input
          id={label}
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="pl-10"
          required={required}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {min && value > 0 && value < min && (
        <p className="text-sm text-destructive">
          Minimum: Rp {formatNumber(min)}
        </p>
      )}
    </div>
  );
}
