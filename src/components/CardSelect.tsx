import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CardSelectOption {
  value: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  details?: string[];
}

interface CardSelectProps {
  options: CardSelectOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  columns?: number;
}

export function CardSelect({
  options,
  value,
  onChange,
  columns = 2,
}: CardSelectProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 2 && 'grid-cols-1 md:grid-cols-2',
        columns === 3 && 'grid-cols-1 md:grid-cols-3',
        columns === 4 && 'grid-cols-2 md:grid-cols-4'
      )}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'relative text-left p-6 rounded-lg border-2 transition-all',
              'hover:shadow-md hover:scale-[1.02]',
              isSelected
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border bg-card hover:border-primary/50'
            )}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-lg">{option.title}</h3>
                {option.badge && (
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">
                    {option.badge}
                  </span>
                )}
              </div>
              
              {option.subtitle && (
                <p className="text-sm font-medium text-primary">
                  {option.subtitle}
                </p>
              )}
              
              {option.description && (
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              )}
              
              {option.details && option.details.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {option.details.map((detail, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-primary mt-0.5">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
