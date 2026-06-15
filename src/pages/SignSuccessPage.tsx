import { useState, useEffect } from 'react';
import { CheckCircle2, Upload, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081/api/v1';

// Produk yang perlu bukti transfer
const NEEDS_PAYMENT_PROOF = ['DEPOSIT', 'SAVING'];

export default function SignSuccessPage() {
    // Ambil appId dan productType dari localStorage (disimpan wizard sebelum kirim sign link)
    const [appId]       = useState(() => localStorage.getItem('app_id') ?? '');
    const [productType] = useState(() => localStorage.getItem('product_type') ?? '');

    const needsProof = NEEDS_PAYMENT_PROOF.includes(productType);

    const [file,          setFile]          = useState<File | null>(null);
    const [preview,       setPreview]       = useState<string | null>(null);
    const [uploading,     setUploading]     = useState(false);
    const [uploaded,      setUploaded]      = useState(false);
    const [error,         setError]         = useState<string | null>(null);

    // Preview gambar saat file dipilih
    useEffect(() => {
        if (!file) { setPreview(null); return; }
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            return () => URL.revokeObjectURL(url);
        }
        setPreview(null);
    }, [file]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > 5 * 1024 * 1024) {
            setError('Ukuran file maksimal 5MB');
            return;
        }
        setError(null);
        setFile(f);
    };

    const handleUpload = async () => {
        if (!file || !appId) return;
        setUploading(true);
        setError(null);
        try {
            const form = new FormData();
            form.append('file', file);
            await axios.post(
                `${API_BASE}/applications/${appId}/payment-proof`,
                form,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            setUploaded(true);
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Gagal mengunggah. Silakan coba lagi.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">

                {/* ── Header sukses TTD ───────────────────────────────── */}
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8 text-success" />
                    </div>
                    <h1 className="text-2xl font-bold">Kontrak Berhasil Ditandatangani!</h1>
                    <p className="text-muted-foreground text-sm">
                        Dokumen kontrak Anda telah ditandatangani secara elektronik.
                    </p>
                </div>

                {/* ── Upload bukti TF (hanya SAVING & DEPOSIT) ────────── */}
                {needsProof && !uploaded && (
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <h2 className="font-semibold text-foreground mb-1">
                                    Upload Bukti Transfer
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Silakan transfer dana ke rekening BPR Perdana, lalu unggah
                                    bukti transfer di bawah ini.
                                </p>
                            </div>

                            {/* Info rekening BPR Perdana */}
                            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 text-sm space-y-1">
                                <p className="font-medium text-foreground">Rekening Tujuan</p>
                                <p className="text-muted-foreground">Bank BPR Perdana</p>
                                <p className="font-mono font-semibold text-foreground">
                                    {/* TODO: ambil dari system config */}
                                    No. Rek: <span className="text-primary">001-123-456789</span>
                                </p>
                                <p className="text-muted-foreground">
                                    a.n. PT BPR Daya Perdana Nusantara
                                </p>
                            </div>

                            {/* File input */}
                            <div>
                                <label
                                    htmlFor="proof-upload"
                                    className={`flex flex-col items-center justify-center w-full h-36 
                                        border-2 border-dashed rounded-lg cursor-pointer transition-colors
                                        ${file
                                            ? 'border-primary bg-primary/5'
                                            : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50'
                                        }`}
                                >
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="h-full w-full object-contain rounded-lg p-1"
                                        />
                                    ) : file ? (
                                        <div className="flex flex-col items-center gap-2 text-primary">
                                            <ImageIcon className="w-8 h-8" />
                                            <span className="text-sm font-medium truncate max-w-[200px]">
                                                {file.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Upload className="w-8 h-8" />
                                            <span className="text-sm">Klik untuk pilih file</span>
                                            <span className="text-xs">JPG, PNG, PDF · Maks 5MB</span>
                                        </div>
                                    )}
                                    <input
                                        id="proof-upload"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>

                            {error && (
                                <p className="text-sm text-destructive">{error}</p>
                            )}

                            <Button
                                className="w-full"
                                onClick={handleUpload}
                                disabled={!file || uploading}
                            >
                                {uploading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengunggah...</>
                                ) : (
                                    <><Upload className="w-4 h-4 mr-2" /> Unggah Bukti Transfer</>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* ── Sukses upload ────────────────────────────────────── */}
                {uploaded && (
                    <Card>
                        <CardContent className="p-6 text-center space-y-2">
                            <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
                            <p className="font-semibold">Bukti Transfer Diterima</p>
                            <p className="text-sm text-muted-foreground">
                                Tim kami akan memproses pengajuan Anda setelah dana diterima.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* ── Info kontak ──────────────────────────────────────── */}
                <p className="text-center text-xs text-muted-foreground">
                    Pertanyaan?{' '}
                    <a href="mailto:cs@bprperdana.co.id" className="text-primary underline">
                        cs@bprperdana.co.id
                    </a>
                </p>
            </div>
        </div>
    );
}