/**
 * ResumeSessionBanner.tsx
 *
 * Banner yang muncul di atas wizard ketika ada session aktif yang bisa dilanjutkan.
 * Ditampilkan di atas Stepper saat wizard pertama kali dimuat.
 */

import { AlertCircle, RotateCcw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ResumeSessionBannerProps {
    stepLabel: string;           // nama step yang akan dilanjutkan, e.g. "Data Tambahan"
    onResume: () => void;
    onStartOver: () => void;
}

export function ResumeSessionBanner({
    stepLabel,
    onResume,
    onStartOver,
}: ResumeSessionBannerProps) {
    return (
        <Alert className="mb-6 border-primary/40 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-sm">
                    Anda memiliki pengajuan yang belum selesai.{' '}
                    <strong>Lanjutkan dari: {stepLabel}</strong>
                </span>
                <div className="flex gap-2 shrink-0">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onStartOver}
                        className="gap-1 text-xs"
                    >
                        <RotateCcw className="w-3 h-3" />
                        Mulai Ulang
                    </Button>
                    <Button
                        size="sm"
                        onClick={onResume}
                        className="gap-1 text-xs"
                    >
                        Lanjutkan
                        <ArrowRight className="w-3 h-3" />
                    </Button>
                </div>
            </AlertDescription>
        </Alert>
    );
}