/**
 * LivenessVerification.tsx
 *
 * Komponen liveness detection menggunakan VIDA Web SDK.
 *
 * PERUBAHAN dari versi lama:
 * - Tambah prop `appId` — dibutuhkan untuk call getLivenessToken(appId)
 * - Token + signingKey sekarang datang dari backend via endpoint yang ter-protect session
 * - VITE_VIDA_SIGNING_KEY dihapus — tidak ada credential di frontend
 * - onComplete hanya return selfieImage + transactionId ke parent (Wizard)
 *   Parent (DepositoWizard) yang handle call submitLiveness() ke backend
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { VidaSDK } from 'vida-web-sdk';
import { getLivenessToken } from '@/lib/api/applicationApi';
import type { VidaSDKConfig, VidaCompleteData, VidaErrorData } from '@/types/vida-sdk';

interface LivenessVerificationProps {
  appId: string;                                                      // ← BARU: wajib
  onComplete: (selfieImage: string, transactionId?: string) => void;
  onError?: (error: string) => void;
  initialSelfie?: string | null;
  ktpImage?: string | null;
}

export function LivenessVerification({
  appId,
  onComplete,
  onError,
  initialSelfie,
}: LivenessVerificationProps) {
  const { t } = useTranslation();
  const sdkContainerRef = useRef<HTMLDivElement>(null);

  const [shouldInitLiveness, setShouldInitLiveness] = useState(false);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selfieImage, setSelfieImage] = useState<string | null>(initialSelfie || null);
  const [error, setError] = useState<string | null>(null);

  // Jika sudah ada selfie dari sebelumnya (resume), langsung complete
  useEffect(() => {
    if (initialSelfie && !selfieImage) {
      setSelfieImage(initialSelfie);
    }
  }, [initialSelfie]);

  // Init SDK setelah div dan flag ready
  // Ganti useEffect yang ada dengan ini:
useEffect(() => {
  if (!shouldInitLiveness) return;

  let cancelled = false;
  setLoading(true);
  setError(null);

  // ← TAMBAH: tunggu DOM render dulu dengan requestAnimationFrame
  const initSDK = async () => {
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const container = document.getElementById('vida-sdk-container');
    if (!container) {
      setError('Container tidak ditemukan');
      setLoading(false);
      return;
    }

    try {
      const tokenData = await getLivenessToken(appId);
      if (cancelled) return;
    console.log('=== VIDA SDK DEBUG ===');
    console.log('VidaSDK object:', typeof VidaSDK, VidaSDK);
    console.log('container el:', document.getElementById('vida-sdk-container'));
    console.log('token:', tokenData.access_token.substring(0, 20) + '...');
    console.log('signingKey:', tokenData.signing_key.substring(0, 10) + '...');
      VidaSDK.init({
        token:                tokenData.access_token.trim(),
        signingKey:           tokenData.signing_key.trim(),
        elementId:            'vida-sdk-container',
        locale:               'ID',
        partnerTransactionId: `dpn-${appId}-${Date.now()}`,
        workflowConfigs: {
          liveness: {
            maxRetryAttempts: 3,
            detectionTimeOut: 90000,
          },
        },
        themeConfigs: {
          primaryButtonBgColor:   '#D43746',
          primaryButtonTextColor: '#ffffff',
          titleTextColor:         '#3D3D3D',
        },
        onComplete: (data: any) => {
           const selfieBase64 = data.base64Image || data.image || '';
            onComplete(selfieBase64, data.transactionId);
        },
        onError: (err: any) => {
          const msg = err?.message || 'Liveness verification gagal';
          setError(msg);
          setShouldInitLiveness(false);
          onError?.(msg);
        },
      });

      setSdkInitialized(true);
    } catch (err: any) {
      if (!cancelled) {
        const msg = err.message || 'Gagal menginisialisasi liveness';
        setError(msg);
        onError?.(msg);
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
  };

  initSDK();

  return () => { cancelled = true; };
}, [shouldInitLiveness]);

  // ─── Render ────────────────────────────────────────────────────────────────

  // Jika sudah ada selfie (selesai / resume)
  if (selfieImage) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">Verifikasi wajah berhasil</span>
        </div>
        <img
          src={selfieImage}
          alt="Selfie"
          className="w-32 h-32 rounded-full object-cover border-2 border-green-500 mx-auto"
        />
        <p className="text-sm text-muted-foreground text-center">
          Foto selfie sudah diambil. Lanjutkan ke step berikutnya.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Camera className="w-12 h-12 mx-auto text-muted-foreground" />
        <h3 className="font-semibold">Verifikasi Wajah</h3>
        <p className="text-sm text-muted-foreground">
          Pastikan wajah Anda terlihat jelas dan pencahayaan cukup.
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SDK container — VIDA SDK akan render UI-nya di sini */}
      <div
      id="vida-sdk-container"
      ref={sdkContainerRef}
      className={`rounded-lg overflow-hidden border min-h-[400px] ${
        shouldInitLiveness ? 'block' : 'hidden'  // ← hidden bukan unmount
      }`}
    />

    {/* Tombol mulai */}
    {!shouldInitLiveness && !loading && !selfieImage && (
      <Button onClick={() => setShouldInitLiveness(true)} className="w-full gap-2">
        <Camera className="w-4 h-4" />
        Mulai Verifikasi Wajah
      </Button>
    )}

    {loading && (
      <div className="flex items-center justify-center gap-2 py-8">
        <Loader2 className="w-4 h-4 animate-spin" />
        Memuat kamera...
      </div>
    )}
  </div>
  );
}