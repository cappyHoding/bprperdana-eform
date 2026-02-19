import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Declare VIDA SDK types
declare global {
  interface Window {
    VidaWebSDK?: any;
  }
}

interface LivenessCaptureProps {
  onComplete: (image: string) => void;
  initialImage?: string | null;
}

export function LivenessCapture({ onComplete, initialImage }: LivenessCaptureProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [verified, setVerified] = useState(!!initialImage);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    // Check if VIDA SDK is loaded
    const checkSDK = () => {
      if (window.VidaWebSDK) {
        setSdkReady(true);
      } else {
        setTimeout(checkSDK, 100);
      }
    };
    checkSDK();
  }, []);

  const startLivenessCheck = async () => {
    if (!sdkReady || !window.VidaWebSDK) {
      toast.error(t('common.error'), {
        description: 'SDK belum siap. Silakan tunggu sebentar.',
      });
      return;
    }

    setLoading(true);
    try {
      // Initialize VIDA SDK for liveness detection
      const result = await window.VidaWebSDK.startLiveness({
        containerId: 'vida-liveness-container',
        onSuccess: (data: any) => {
          console.log('Liveness success:', data);
          if (data.image) {
            setImage(data.image);
            setVerified(true);
            toast.success(t('common.success'), {
              description: 'Verifikasi wajah berhasil',
            });
          }
        },
        onError: (error: any) => {
          console.error('Liveness error:', error);
          toast.error(t('common.error'), {
            description: 'Gagal memverifikasi wajah',
          });
        },
      });
    } catch (error) {
      console.error('VIDA SDK error:', error);
      toast.error(t('common.error'), {
        description: 'Terjadi kesalahan saat memulai verifikasi',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (image) {
      onComplete(image);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{t('ekyc.selfie')}</h2>
        <p className="text-muted-foreground">{t('ekyc.selfieDesc')}</p>
      </div>

      {!image ? (
        <Card className="p-8">
          <div className="flex flex-col items-center gap-4">
            <div 
              id="vida-liveness-container" 
              ref={containerRef}
              className="w-full max-w-sm mx-auto"
            />
            
            {!loading && (
              <>
                <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-secondary" />
                </div>
                
                <div className="text-center space-y-2">
                  <p className="font-medium">Verifikasi Wajah</p>
                  <p className="text-sm text-muted-foreground">
                    Pastikan wajah Anda terlihat jelas dan ikuti instruksi pada layar
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={startLivenessCheck}
                  disabled={!sdkReady}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {sdkReady ? 'Mulai Verifikasi' : 'Memuat SDK...'}
                </Button>
              </>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="relative aspect-[3/4] max-w-sm mx-auto">
              <img
                src={image}
                alt="Selfie Preview"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            {!loading && !verified && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => {
                  setImage(null);
                  setVerified(false);
                }}
              >
                {t('actions.change')}
              </Button>
            )}
          </Card>

          {loading && (
            <Card className="p-6">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-secondary" />
                <span className="text-muted-foreground">Memverifikasi wajah...</span>
              </div>
            </Card>
          )}

          {verified && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Verifikasi berhasil</span>
              </div>

              <Button
                type="button"
                onClick={handleConfirm}
                className="w-full"
              >
                {t('actions.confirm')}
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
