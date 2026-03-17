/**
 * useResumeSession.ts
 *
 * Hook untuk deteksi dan handle resume wizard.
 * Dipakai di DepositoWizard, TabunganWizard, PinjamanWizard.
 *
 * Cara pakai:
 *   const { resuming, resumeStep } = useResumeSession('DEPOSIT', (step) => {
 *     setCurrentStep(step);
 *   });
 */

import { useState, useEffect } from 'react';
import { getActiveSessionForProduct, clearSession } from '@/lib/session';

type ProductType = 'SAVING' | 'DEPOSIT' | 'LOAN';

// Map backend step (3-8) ke frontend step index (0-based)
// Backend step 3 = OCR selesai → frontend di step 2 (OCR)
// Backend step 4 = personal info selesai → frontend di step 3 (personal info)
// dst.
const BACKEND_TO_FRONTEND_STEP: Record<ProductType, Record<number, number>> = {
    DEPOSIT: {
        3: 2, // OCR selesai → lanjut step 3 (personal info)
        4: 3, // personal info selesai → lanjut step 4 (liveness)  
        5: 4, // liveness selesai → lanjut step 5 (bank)
        6: 5, // bank selesai → lanjut step 6 (summary)
        7: 6, // summary / sudah submit
    },
    SAVING: {
        3: 2,
        4: 3,
        5: 4,
        6: 5,
        7: 6,
    },
    LOAN: {
        3: 3, // OCR (loan punya collateral di step 2)
        4: 4,
        5: 5,
        6: 6,
        7: 7,
    },
};

interface UseResumeSessionResult {
    resuming: boolean;       // true saat sedang cek/load session
    hasResume: boolean;      // true jika ada session yang bisa di-resume
    resumeStep: number;      // frontend step index untuk resume
    confirmResume: () => void;  // user pilih lanjutkan
    dismissResume: () => void;  // user pilih mulai ulang
}

export function useResumeSession(
    productType: ProductType,
    onResume: (frontendStep: number) => void,
): UseResumeSessionResult {
    const [resuming, setResuming] = useState(true);
    const [hasResume, setHasResume] = useState(false);
    const [resumeStep, setResumeStep] = useState(0);

    useEffect(() => {
        const session = getActiveSessionForProduct(productType);

        if (!session) {
            setResuming(false);
            return;
        }

        // Ada session aktif — hitung frontend step berdasarkan backend current_step
        const stepMap = BACKEND_TO_FRONTEND_STEP[productType];
        const backendStep = session.currentStep;

        // Ambil frontend step yang paling dekat dengan backend step
        const frontendStep = stepMap[backendStep] ?? 1;

        // Hanya tawarkan resume kalau sudah lewat step 1 (product selection)
        if (frontendStep > 1) {
            setHasResume(true);
            setResumeStep(frontendStep);
        }

        setResuming(false);
    }, [productType]);

    const confirmResume = () => {
        onResume(resumeStep);
        setHasResume(false);
    };

    const dismissResume = () => {
        clearSession();
        setHasResume(false);
    };

    return { resuming, hasResume, resumeStep, confirmResume, dismissResume };
}