import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, Camera } from "lucide-react";
import { toast } from "sonner";
import { VidaSDK } from "vida-web-sdk"; // Import dari NPM package
import { vidaApi } from "@/lib/api";
import type { VidaSDKConfig, VidaCompleteData, VidaErrorData } from "@/types/vida-sdk";

interface LivenessVerificationProps {
    onComplete: (selfieImage: string, transactionId?: string) => void;
    onError?: (error: string) => void;
    initialSelfie?: string | null;
    ktpImage?: string;
}

export function LivenessVerification({
                                         onComplete,
                                         onError,
                                         initialSelfie,
                                         ktpImage,
                                     }: LivenessVerificationProps) {
    const { t } = useTranslation();
    const sdkContainerRef = useRef<HTMLDivElement>(null);

    const [shouldInitLiveness, setShouldInitLiveness] = useState(false);
    const [sdkInitialized, setSdkInitialized] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selfieImage, setSelfieImage] = useState<string | null>(initialSelfie || null);
    const [livenessResult, setLivenessResult] = useState<VidaCompleteData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);

    // Inisialisasi VIDA SDK setelah div dan token tersedia
    useEffect(() => {
        if (shouldInitLiveness && sdkContainerRef.current) {
            setLoading(true);
            (async () => {
                try {
                    const { token, signingKey } = await vidaApi.getVidaToken();
                    const partnerTransactionId = `dpn-eform-dep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    const config: VidaSDKConfig = {
                        token: token.trim(),
                        signingKey: (signingKey || "").trim(),
                        elementId: "vida-sdk-container",
                        locale: t("locale") === "id" ? "ID" : "EN",
                        partnerTransactionId,
                        workflowConfigs: {
                            liveness: {
                                skipTutorialScreen: false,
                                skipSelfieReviewScreen: false,
                                cameraFrameShape: "oval",
                                maxRetryAttempts: 3,
                                detectionTimeOut: 90000,
                                hideErrorCodeOnSelfieReview: false,
                            },
                        },
                        themeConfigs: {
                            primaryButtonBgColor: "#1976d2",
                            primaryButtonTextColor: "#ffffff",
                            secondaryButtonBgColor: "#f5f5f5",
                            secondaryButtonTextColor: "#333333",
                            titleTextColor: "#333333",
                            descriptionTextColor: "#666666",
                            cameraFrameColor: "#1976d2",
                            loadingSpinnerColor: "#1976d2",
                        },
                        onComplete: async (data: VidaCompleteData) => {

                            setLivenessResult(data);

                            setSelfieImage(data.base64Image);
                            setSdkInitialized(false);

                            toast.success(t("common.success"), {
                                description: "Verifikasi liveness berhasil!",
                            });
                            console.log(data)
                        },
                        onError: (errorData: VidaErrorData) => {
                            setError(getErrorMessage(errorData.errorCode, errorData.errorMessage));
                            setSdkInitialized(false);
                            toast.error("Verifikasi Gagal", {
                                description: getErrorMessage(errorData.errorCode, errorData.errorMessage),
                            });
                            onError?.(getErrorMessage(errorData.errorCode, errorData.errorMessage));
                        },
                    };

                    VidaSDK.init(config); // ========== Pakai import npm
                    setSdkInitialized(true);
                } catch (err: any) {
                    setError(err.message || "Gagal menginisialisasi VIDA SDK");
                    toast.error("Error", {
                        description: err.message || "Gagal menginisialisasi VIDA SDK",
                    });
                } finally {
                    setLoading(false);
                }
            })();
        }
        // Cleanup on unmount or re-trigger
        return () => {
            VidaSDK.destroy?.();
        };
        // eslint-disable-next-line
    }, [shouldInitLiveness]);

    const getErrorMessage = (code: string, fallback: string): string => {
        const errorMessages: Record<string, string> = {
            "40001": "Tidak ada koneksi internet",
            "40002": "Koneksi timeout",
            "40003": "Token tidak valid atau expired",
            "70001": "Akses kamera ditolak",
            "70002": "Gagal mengunduh model AI",
            "70003": "Browser tidak didukung",
            "70007": "Waktu deteksi habis",
            "70010": "Maksimal percobaan tercapai",
            "1041": "Liveness check gagal",
            "1051": "Wajah terhalang",
            "1052": "Dekatkan wajah Anda",
            "1053": "Pencahayaan kurang",
            "1054": "Terdeteksi lebih dari satu wajah",
            "1055": "Wajah tidak terdeteksi",
            "1059": "Foto terlalu blur",
            "1060": "Posisikan wajah lurus",
            "1062": "Buka mata Anda",
            "1064": "Foto terlalu gelap",
            "1065": "Foto terlalu terang",
        };
        return errorMessages[code] || fallback;
    };

    const handleRetry = () => {
        setSelfieImage(null);
        setError(null);
        setSdkInitialized(false);
        setShouldInitLiveness(false);
        VidaSDK.destroy?.();
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Verifikasi Liveness</h2>
                <p className="text-muted-foreground">
                    Lakukan verifikasi wajah untuk memastikan keaslian identitas Anda
                </p>
            </div>

            {/* Render SDK container ONLY after intent to start liveness */}
            {shouldInitLiveness && (
                <div id="vida-sdk-container" ref={sdkContainerRef} className="w-full min-h-[500px]" />
            )}

            {!selfieImage && !sdkInitialized && !shouldInitLiveness && !loading && !error && (
                <Card className="p-8">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                            <Camera className="w-12 h-12 text-primary" />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="font-medium">Verifikasi Wajah</p>
                            <ul className="text-sm text-muted-foreground space-y-1 text-left max-w-md mx-auto">
                                <li>✓ Pastikan wajah terlihat jelas</li>
                                <li>✓ Tidak ada penghalang</li>
                                <li>✓ Pencahayaan cukup</li>
                                <li>✓ Hanya satu wajah</li>
                            </ul>
                        </div>
                        <Button
                            type="button"
                            onClick={() => setShouldInitLiveness(true)}
                            disabled={loading}
                            size="lg"
                            className="mt-4"
                        >
                            <Camera className="w-4 h-4 mr-2" />
                            Mulai Verifikasi
                        </Button>
                    </div>
                </Card>
            )}

            {(loading && !sdkInitialized) && (
                <Card className="p-6">
                    <div className="flex items-center justify-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-muted-foreground">
              Menginisialisasi verifikasi...
            </span>
                    </div>
                </Card>
            )}

            {verifying && (
                <Card className="p-6">
                    <div className="flex items-center justify-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-muted-foreground">
              Memverifikasi hasil...
            </span>
                    </div>
                </Card>
            )}

            {(error && !sdkInitialized) && (
                <Card className="p-6 border-destructive">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-medium text-destructive mb-2">
                                Verifikasi Gagal
                            </p>
                            <p className="text-sm text-muted-foreground mb-4">
                                {error}
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleRetry}
                            >
                                Coba Lagi
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {(selfieImage && !verifying) && (
                <Card className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">
                             Verifikasi liveness berhasil!
                         </span>
                    </div>
                    <div className="space-y-4">
                        <img
                            src={selfieImage}
                            alt="Selfie Verification"
                            className="w-full h-auto rounded-lg max-w-md mx-auto border-2 border-green-200"
                        />
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleRetry}
                                className="flex-1"
                            >
                                Ambil Ulang
                            </Button>
                            <Button
                                type="button"
                                onClick={() => onComplete(selfieImage)}
                                className="flex-1"
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Konfirmasi
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
