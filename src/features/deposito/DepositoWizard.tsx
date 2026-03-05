/**
 * DepositoWizard.tsx
 *
 * Multi-step form untuk pengajuan Deposito.
 * Setiap step memanggil backend API sebelum lanjut ke step berikutnya.
 *
 * MAPPING STEP → BACKEND:
 *   Step 0 (Agreement)     → POST /applications/agree
 *   Step 1 (Placement)     → POST /applications              ← dapat session_token
 *   Step 2 (KTP OCR)       → POST /applications/:id/ocr
 *   Step 3 (Personal Info) → PATCH /applications/:id/personal-info
 *   Step 4 (Liveness)      → GET  /applications/:id/liveness/token → SDK → POST liveness
 *   Step 5 (Bank Account)  → PATCH /applications/:id/disbursement
 *   Step 6 (Summary)       → POST /applications/:id/submit
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Stepper } from '@/components/Stepper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

import { DepositoFormData } from '@/types/domain';
import { getApplicationId, loadSession, clearSession } from '@/lib/session';
import {
  acceptAgreement,
  createApplication,
  submitOCR,
  updatePersonalInfo,
  getLivenessToken,
  submitLiveness,
  updateDisbursement,
  submitApplication,
} from '@/lib/api/applicationApi';
import { fileToBase64 } from '@/lib/api/ekycApi';

import { AgreementStep } from './steps/AgreementStep';
import { PlacementInfoStep } from './steps/PlacementInfoStep';
import { AdditionalDataStep } from './steps/AdditionalDataStep';
import { BankAccountStep } from './steps/BankAccountStep';
import { SummaryStep } from './steps/SummaryStep';
import { KtpOcrUpload } from '@/features/ekyc/KtpOcrUpload';
import { LivenessVerification } from '@/features/ekyc';

// ─── Initial State ────────────────────────────────────────────────────────────

const initialFormData: DepositoFormData = {
  agreement: false,
  info: {
    amount: 0,
    tenor: 1,
    aroType: 'nonAro',
    sourceOfFund: '',
    placementPurpose: '',
  },
  ktpData: null,
  ktpImage: null,
  selfieImage: null,
  livenessData: null,
  livenessTransactionId: null,
  additionalData: {
    alamatTinggal: '',
    pekerjaan: '',
    lamaBekerjaUsaha: '',
    penghasilanPerbulan: 0,
    namaIbuKandung: '',
    pendidikanTerakhir: '',
    email: '',
    nomorHandphone: '',
    alamatUsaha: '',
  },
  bankAccount: {
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function DepositoWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<DepositoFormData>(initialFormData);

  // State untuk loading dan error per-step
  const [submitting, setSubmitting] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const steps = [
    { label: t('deposito.step1') }, // Agreement
    { label: t('deposito.step2') }, // Info Penempatan
    { label: t('deposito.step3') }, // KTP OCR
    { label: t('deposito.step4') }, // Data Tambahan
    { label: t('deposito.step5') }, // Liveness
    { label: t('deposito.step6') }, // Rekening Bank
    { label: t('deposito.step7') }, // Ringkasan & Submit
  ];

  // ─── Validation ─────────────────────────────────────────────────────────────

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0:
        return formData.agreement;
      case 1:
        return (
          formData.info.amount >= 1_000_000 &&
          !!formData.info.sourceOfFund &&
          !!formData.info.placementPurpose
        );
      case 2:
        return formData.ktpData !== null;
      case 3:
        return (
          !!formData.additionalData.alamatTinggal &&
          !!formData.additionalData.pekerjaan &&
          !!formData.additionalData.lamaBekerjaUsaha &&
          formData.additionalData.penghasilanPerbulan > 0 &&
          !!formData.additionalData.namaIbuKandung &&
          !!formData.additionalData.pendidikanTerakhir &&
          !!formData.additionalData.email &&
          !!formData.additionalData.nomorHandphone &&
          !!formData.additionalData.alamatUsaha
        );
      case 4:
        return formData.selfieImage !== null;
      case 5:
        return (
          !!formData.bankAccount.bankName &&
          !!formData.bankAccount.accountNumber &&
          !!formData.bankAccount.accountHolderName
        );
      default:
        return true;
    }
  };

  // ─── Navigation ──────────────────────────────────────────────────────────────

  const goNext = () => {
    setStepError(null);
    setCurrentStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStepError(null);
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  // ─── Step Handlers (API calls) ────────────────────────────────────────────

  /**
   * Step 0 → Step 1
   * Kirim agreement ke backend, simpan agreement_token di session.
   */
  const handleAgreementNext = async () => {
    setSubmitting(true);
    setStepError(null);
    try {
      await acceptAgreement();
      goNext();
    } catch (err: any) {
      setStepError(err.message || 'Gagal menyimpan persetujuan.');
      toast.error('Gagal', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Step 1 → Step 2
   * Buat application di backend. Backend return session_token yang
   * disimpan otomatis oleh createApplication() via session.ts.
   */
  const handleProductNext = async () => {
    setSubmitting(true);
    setStepError(null);
    try {
      const rolloverMap: Record<string, string> = {
        'aro':     'ARO',
        'aroRate': 'ARO_RATE',
        'nonAro':  'NON_ARO',
      };
      await createApplication({
        product_type: 'DEPOSIT',
        deposit: {
          product_name:       'Deposito',
          placement_amount:   formData.info.amount,
          tenor_months:       formData.info.tenor,
          rollover_type:      rolloverMap[formData.info.aroType] ?? formData.info.aroType,
          source_of_funds:    formData.info.sourceOfFund,
          investment_purpose: formData.info.placementPurpose,
        },
      });
      goNext();
    } catch (err: any) {
      setStepError(err.message || 'Gagal membuat pengajuan.');
      toast.error('Gagal', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Step 2 (OCR) — dipanggil dari KtpOcrUpload.onComplete
   * KtpOcrUpload sudah handle submit ke backend via submitOCR().
   * Di sini kita hanya simpan hasil OCR ke formData dan lanjut.
   */
  const handleOcrComplete = (ktpData: any, ktpImage: string) => {
    setFormData((prev) => ({ ...prev, ktpData, ktpImage }));
    goNext();
  };

  /**
   * Step 3 → Step 4
   * Kirim personal info (data tambahan + kontak) ke backend.
   */
  const handlePersonalInfoNext = async () => {
    const appId = getApplicationId();
    if (!appId) {
      setStepError('Session tidak ditemukan. Silakan mulai ulang.');
      return;
    }

    setSubmitting(true);
    setStepError(null);
    try {
      const ad = formData.additionalData;
      await updatePersonalInfo(appId, {
        email:               ad.email,
        phone_number:        ad.nomorHandphone,
        phone_wa:            ad.nomorHandphone,
        mothers_maiden_name: ad.namaIbuKandung,
        occupation:          ad.pekerjaan,
        work_duration:       ad.lamaBekerjaUsaha,
        monthly_income:      ad.penghasilanPerbulan,
        education:           ad.pendidikanTerakhir,
        work_address:        ad.alamatUsaha,
      });
      goNext();
    } catch (err: any) {
      setStepError(err.message || 'Gagal menyimpan data pribadi.');
      toast.error('Gagal', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Step 4 (Liveness) — dipanggil dari LivenessVerification.onComplete
   * Kirim selfie base64 ke backend untuk fraud assessment.
   */
  const handleLivenessComplete = async (selfieImage: string, transactionId?: string) => {
  const appId = getApplicationId();
  if (!appId) {
    setStepError('Session tidak ditemukan. Silakan mulai ulang.');
    return;
  }

  setFormData((prev) => ({
    ...prev,
    selfieImage,
    livenessTransactionId: transactionId || null,
  }));

  setSubmitting(true);
  setStepError(null);
  try {
    const base64 = selfieImage.includes(',')
      ? selfieImage.split(',')[1]
      : selfieImage;

    await submitLiveness(appId, base64, transactionId); // ← TAMBAH transactionId di sini
    goNext();
  } catch (err: any) {
    setStepError(err.message || 'Gagal memverifikasi identitas.');
    toast.error('Verifikasi gagal', { description: err.message });
  } finally {
    setSubmitting(false);
  }
};

  const handleLivenessError = (error: string) => {
    setStepError(error);
    toast.error('Liveness gagal', { description: error });
  };

  /**
   * Step 5 → Step 6
   * Simpan data rekening bank.
   */
  const handleDisbursementNext = async () => {
    const appId = getApplicationId();
    if (!appId) {
      setStepError('Session tidak ditemukan. Silakan mulai ulang.');
      return;
    }

    setSubmitting(true);
    setStepError(null);
    try {
      await updateDisbursement(appId, {
        bank_name:      formData.bankAccount.bankName,
        bank_code:      '',
        account_number: formData.bankAccount.accountNumber,
        account_holder: formData.bankAccount.accountHolderName,
      });
      goNext();
    } catch (err: any) {
      setStepError(err.message || 'Gagal menyimpan rekening bank.');
      toast.error('Gagal', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Step 6 — Final submit.
   */
  const handleFinalSubmit = async () => {
    const appId = getApplicationId();
    if (!appId) {
      setStepError('Session tidak ditemukan. Silakan mulai ulang.');
      return;
    }

    setSubmitting(true);
    setStepError(null);
    try {
      await submitApplication(appId);
      clearSession(); // bersihkan session setelah submit berhasil
      toast.success('Pengajuan berhasil dikirim!');
      navigate('/success');
    } catch (err: any) {
      setStepError(err.message || 'Gagal mengirim pengajuan.');
      toast.error('Gagal submit', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── handleNext dispatcher ────────────────────────────────────────────────
  // Dipanggil oleh tombol "Lanjut" — tiap step punya handler berbeda.

  const handleNext = () => {
    switch (currentStep) {
      case 0: return handleAgreementNext();
      case 1: return handleProductNext();
      // Step 2 tidak pakai handleNext — KtpOcrUpload punya onComplete sendiri
      case 3: return handlePersonalInfoNext();
      // Step 4 tidak pakai handleNext — LivenessVerification punya onComplete sendiri
      case 5: return handleDisbursementNext();
      case 6: return handleFinalSubmit();
      default: goNext();
    }
  };

  // ─── Render Steps ─────────────────────────────────────────────────────────

  const renderStep = () => {
    const appId = getApplicationId() ?? '';

    switch (currentStep) {
      case 0:
        return (
          <AgreementStep
            agreed={formData.agreement}
            onAgree={(agreed) => setFormData({ ...formData, agreement: agreed })}
          />
        );

      case 1:
        return (
          <PlacementInfoStep
            data={formData.info}
            onChange={(info) => setFormData({ ...formData, info })}
          />
        );

      case 2:
        // KtpOcrUpload handle upload + OCR call ke backend secara internal.
        // Perlu pass appId agar bisa call submitOCR(appId, base64).
        return (
          <KtpOcrUpload
            appId={appId}
            initialData={formData.ktpData}
            initialImage={formData.ktpImage}
            onComplete={handleOcrComplete}
            onError={(err) => {
              setStepError(err);
              toast.error('OCR gagal', { description: err });
            }}
          />
        );

      case 3:
        return (
          <AdditionalDataStep
            data={formData.additionalData}
            onChange={(additionalData) => setFormData({ ...formData, additionalData })}
          />
        );

      case 4:
        // LivenessVerification handle getToken + SDK init + submit secara internal.
        // Perlu pass appId untuk getLivenessToken(appId).
        return (
          <LivenessVerification
            appId={appId}
            initialSelfie={formData.selfieImage}
            ktpImage={formData.ktpImage}
            onComplete={handleLivenessComplete}
            onError={handleLivenessError}
          />
        );

      case 5:
        return (
          <BankAccountStep
            data={formData.bankAccount}
            onChange={(bankAccount) => setFormData({ ...formData, bankAccount })}
          />
        );

      case 6:
        return (
          <SummaryStep
            formData={formData}
            onSubmit={handleFinalSubmit}
            submitting={submitting}
          />
        );

      default:
        return null;
    }
  };

  // Tombol "Lanjut" disembunyikan di step yang handle navigasi sendiri (OCR & Liveness)
  const showNextButton = currentStep < steps.length - 1
    && currentStep !== 2   // KtpOcrUpload handle sendiri
    && currentStep !== 4;  // LivenessVerification handle sendiri

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold text-center mb-8">
            {t('deposito.formTitle')}
          </h1>

          <Stepper steps={steps} currentStep={currentStep} />

          <Card className="p-6 md:p-8 mt-8">
            {renderStep()}
          </Card>

          {/* Error message */}
          {stepError && (
            <div className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {stepError}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-4 mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={submitting}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('actions.back')}
            </Button>

            {showNextButton && (
              <Button
                onClick={handleNext}
                disabled={!canProceed() || submitting}
                className="ml-auto gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {currentStep === steps.length - 1 ? t('actions.submit') : t('actions.next')}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}