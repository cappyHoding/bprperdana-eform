import { useState } from 'react';
import {
    Search, CheckCircle2, Clock, XCircle, FileText,
    PenTool, AlertCircle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import axios from 'axios';


const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081/api/v1';

// ─── Types ────────────────────────────────────────────────────────────────────

type AppStatus =
    | 'DRAFT' | 'PENDING_REVIEW' | 'IN_REVIEW' | 'RECOMMENDED'
    | 'APPROVED' | 'REJECTED' | 'SIGNING' | 'COMPLETED' | 'EXPIRED';

interface StatusResult {
    application_id: string;
    status: AppStatus;
    status_label: string;
    product_type: string;
    customer_name?: string;
    submitted_at?: string;
    updated_at: string;
    message: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AppStatus, {
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
    step: number;
}> = {
    DRAFT: { icon: FileText, color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-muted', step: 0 },
    PENDING_REVIEW: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', step: 1 },
    IN_REVIEW: { icon: Search, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', step: 2 },
    RECOMMENDED: { icon: CheckCircle2, color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/30', step: 3 },
    APPROVED: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', step: 4 },
    REJECTED: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', step: -1 },
    SIGNING: { icon: PenTool, color: 'text-cyan-600', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', step: 5 },
    COMPLETED: { icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-500/10', border: 'border-teal-500/30', step: 6 },
    EXPIRED: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-500/10', border: 'border-orange-500/30', step: -1 },
};

const PRODUCT_LABEL: Record<string, string> = {
    SAVING: 'Tabungan', DEPOSIT: 'Deposito', LOAN: 'Pinjaman',
};

const TIMELINE_STEPS = [
    { label: 'Pengajuan Dikirim', status: ['PENDING_REVIEW', 'IN_REVIEW', 'RECOMMENDED', 'APPROVED', 'SIGNING', 'COMPLETED'] },
    { label: 'Dalam Review', status: ['IN_REVIEW', 'RECOMMENDED', 'APPROVED', 'SIGNING', 'COMPLETED'] },
    { label: 'Direkomendasikan', status: ['RECOMMENDED', 'APPROVED', 'SIGNING', 'COMPLETED'] },
    { label: 'Disetujui', status: ['APPROVED', 'SIGNING', 'COMPLETED'] },
    { label: 'Penandatanganan', status: ['SIGNING', 'COMPLETED'] },
    { label: 'Selesai', status: ['COMPLETED'] },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StatusTrackingPage() {
    const [appId, setAppId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<StatusResult | null>(null);
    const [error, setError] = useState('');

    const handleTrack = async () => {
        const trimmed = appId.trim();
        if (!trimmed) {
            setError('Masukkan nomor pengajuan terlebih dahulu');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await axios.get(`${API_BASE}/applications/track`, {
                params: { id: trimmed }
            });

            if (res.data.success) {
                setResult(res.data.data);
            } else {
                setError(res.data.message ?? 'Pengajuan tidak ditemukan.');
            }
        } catch (err: any) {
            if (err.response?.status === 404) {
                setError('Pengajuan tidak ditemukan. Pastikan ID pengajuan sudah benar.');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Gagal menghubungi server. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    const cfg = result ? STATUS_CONFIG[result.status] : null;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-primary text-primary-foreground py-8 px-4">
                <div className="max-w-lg mx-auto text-center">
                    <h1 className="text-2xl font-bold mb-1">BPR Perdana</h1>
                    <p className="text-primary-foreground/80 text-sm">
                        Cek Status Pengajuan
                    </p>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 py-8 space-y-6">

                {/* Search card */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <h2 className="font-semibold text-foreground mb-1">
                                Nomor Pengajuan
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Masukkan ID pengajuan yang Anda terima saat submit formulir
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                placeholder="contoh: 89d0b6f8-4baf-47c0-..."
                                value={appId}
                                onChange={(e) => {
                                    setAppId(e.target.value);
                                    setError('');
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                                className="font-mono text-sm"
                            />
                            <Button
                                onClick={handleTrack}
                                disabled={loading || !appId.trim()}
                                className="shrink-0"
                            >
                                {loading
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <Search className="w-4 h-4" />}
                            </Button>
                        </div>

                        {error && (
                            <p className="text-sm text-destructive flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Result */}
                {result && cfg && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">

                        {/* Status utama */}
                        <Card className={`border-2 ${cfg.border}`}>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`w-14 h-14 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
                                        <cfg.icon className={`w-7 h-7 ${cfg.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className={`text-lg font-bold ${cfg.color}`}>
                                                {result.status_label}
                                            </span>
                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                                {PRODUCT_LABEL[result.product_type] ?? result.product_type}
                                            </span>
                                        </div>
                                        {result.customer_name && (
                                            <p className="text-sm text-muted-foreground mb-2">
                                                Atas nama: <span className="font-medium text-foreground">{result.customer_name}</span>
                                            </p>
                                        )}
                                        <p className="text-sm text-foreground leading-relaxed">
                                            {result.message}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline progress — hanya untuk status normal (bukan rejected/expired) */}
                        {result.status !== 'REJECTED' && result.status !== 'EXPIRED' && result.status !== 'DRAFT' && (
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-sm mb-4 text-foreground">
                                        Progres Pengajuan
                                    </h3>
                                    <ol className="space-y-3">
                                        {TIMELINE_STEPS.map((step, i) => {
                                            const done = step.status.includes(result.status);
                                            const isCurrent = TIMELINE_STEPS[i].status.includes(result.status) &&
                                                (i === TIMELINE_STEPS.length - 1 ||
                                                    !TIMELINE_STEPS[i + 1].status.includes(result.status));
                                            return (
                                                <li key={i} className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${done
                                                        ? 'bg-success text-white'
                                                        : 'bg-muted text-muted-foreground'
                                                        }`}>
                                                        {done ? '✓' : i + 1}
                                                    </div>
                                                    <span className={`text-sm ${isCurrent
                                                        ? 'font-semibold text-foreground'
                                                        : done
                                                            ? 'text-foreground'
                                                            : 'text-muted-foreground'
                                                        }`}>
                                                        {step.label}
                                                        {isCurrent && (
                                                            <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                                                Saat ini
                                                            </span>
                                                        )}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ol>
                                </CardContent>
                            </Card>
                        )}

                        {/* Info tambahan */}
                        <Card>
                            <CardContent className="p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">No. Pengajuan</span>
                                    <span className="font-mono text-xs font-medium">
                                        {result.application_id.slice(0, 8).toUpperCase()}...
                                    </span>
                                </div>
                                {result.submitted_at && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Tanggal Submit</span>
                                        <span className="font-medium">{result.submitted_at}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Terakhir Diperbarui</span>
                                    <span className="font-medium">{result.updated_at}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* CTA untuk SIGNING */}
                        {result.status === 'SIGNING' && (
                            <Card className="border-cyan-500/30 bg-cyan-500/5">
                                <CardContent className="p-4">
                                    <p className="text-sm text-cyan-700 font-medium mb-1">
                                        ✉️ Cek email Anda
                                    </p>
                                    <p className="text-sm text-cyan-600">
                                        Link penandatanganan kontrak telah dikirimkan ke email yang Anda daftarkan.
                                        Segera tandatangani sebelum batas waktu.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* CTA untuk COMPLETED */}
                        {result.status === 'COMPLETED' && (
                            <Card className="border-teal-500/30 bg-teal-500/5">
                                <CardContent className="p-4 text-center">
                                    <p className="text-2xl mb-2">🎉</p>
                                    <p className="text-sm font-semibold text-teal-700 mb-1">
                                        Selamat bergabung dengan BPR Perdana!
                                    </p>
                                    <p className="text-xs text-teal-600">
                                        Rekening Anda akan aktif dalam 1–3 hari kerja.
                                        Anda akan dihubungi oleh tim kami.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Kontak CS untuk REJECTED/EXPIRED */}
                        {(result.status === 'REJECTED' || result.status === 'EXPIRED') && (
                            <Card className="border-muted">
                                <CardContent className="p-4">
                                    <p className="text-sm font-medium text-foreground mb-1">
                                        Butuh bantuan?
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Hubungi Customer Service BPR Perdana di{' '}
                                        <a href="mailto:cs@bprperdana.co.id" className="text-primary underline">
                                            cs@bprperdana.co.id
                                        </a>
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}