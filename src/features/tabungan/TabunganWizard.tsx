/**
 * TabunganWizard.tsx
 *
 * Multi-step form untuk pengajuan Tabungan.
 * Pola identik dengan DepositoWizard — setiap step memanggil backend API.
 *
 * MAPPING STEP → BACKEND:
 *   Step 0 (Agreement)     → POST /applications/agree
 *   Step 1 (Product)       → POST /applications              ← dapat session_token
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

import { TabunganProduct, AdditionalData, BankAccount } from '@/types/domain';
import { KtpOcrData } from '@/types/api';
import { getApplicationId, clearSession } from '@/lib/session';
import {
  acceptAgreement,
  createApplication,
  updatePersonalInfo,
  getLivenessToken,
  submitLiveness,
  updateDisbursement,
  submitApplication,
} from '@/lib/api/applicationApi';

import { AgreementStep } from '@/features/deposito/steps/AgreementStep';
import { AdditionalDataStep } from '@/features/deposito/steps/AdditionalDataStep';
import { BankAccountStep } from '@/features/deposito/steps/BankAccountStep';
import { ProductSelectionStep } from './steps/ProductSelectionStep';
import { SummaryStep } from './steps/SummaryStep';
import { KtpOcrUpload } from '@/features/ekyc/KtpOcrUpload';
import { LivenessVerification } from '@/features/ekyc';
import OTPVerification from '@/components/OTPVerification';

import { useResumeSession } from '@/hooks/useResumeSession';
import { ResumeSessionBanner } from '@/components/ResumeSessionBanner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TabunganFormData {
  agreement: boolean;
  product: TabunganProduct;
  initialDeposit: number;
  sourceOfFund: string;
  purposeOfSaving: string;
  ktpData: KtpOcrData | null;
  ktpImage: string | null;
  selfieImage: string | null;
  livenessTransactionId: string | null;
  additionalData: AdditionalData;
  bankAccount: BankAccount;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialFormData: TabunganFormData = {
  agreement: false,
  product: 'Perdana',
  initialDeposit: 0,
  sourceOfFund: '',
  purposeOfSaving: '',
  ktpData: null,
  ktpImage: null,
  selfieImage: null,
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

export default function TabunganWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [formData, setFormData] = useState<TabunganFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const { hasResume, resumeStep, confirmResume, dismissResume } = useResumeSession(
    'SAVING',
    (step) => setCurrentStep(step),
  );

  const steps = [
    { label: t('tabungan.step1') },
    { label: t('tabungan.step2') },
    { label: t('tabungan.step3') },
    { label: t('tabungan.step4') },
    { label: t('tabungan.step5') },
    { label: t('tabungan.step6') },
    { label: t('tabungan.step7') },
  ];

  const resumeStepLabel = steps[resumeStep]?.label ?? '';

  // ─── Validation ─────────────────────────────────────────────────────────────

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0:
        return formData.agreement;
      case 1:
        return (
          formData.initialDeposit > 0 &&
          !!formData.sourceOfFund &&
          !!formData.purposeOfSaving
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

  // ─── Step Handlers ────────────────────────────────────────────────────────

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

  const handleProductNext = async () => {
    setSubmitting(true);
    setStepError(null);
    try {
      const productNameMap: Record<TabunganProduct, string> = {
        'Perdana': 'Tabungan Perdana',
        'PerdanaPlus': 'Tabungan Perdana Plus',
        'TabunganKu': 'TabunganKu',
      };
      await createApplication({
        product_type: 'SAVING',
        saving: {
          product_name: productNameMap[formData.product],
          initial_deposit: formData.initialDeposit,
          source_of_funds: formData.sourceOfFund,
          saving_purpose: formData.purposeOfSaving,
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

  const handleOcrComplete = (ktpData: any, ktpImage: string) => {
    setFormData((prev) => ({ ...prev, ktpData, ktpImage }));
    goNext();
  };

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
        email: ad.email,
        phone_number: ad.nomorHandphone,
        phone_wa: ad.nomorHandphone,
        mothers_maiden_name: ad.namaIbuKandung,
        occupation: ad.pekerjaan,
        work_duration: ad.lamaBekerjaUsaha,
        monthly_income: ad.penghasilanPerbulan,
        education: ad.pendidikanTerakhir,
        work_address: ad.alamatUsaha,
      });
      goNext();
    } catch (err: any) {
      setStepError(err.message || 'Gagal menyimpan data pribadi.');
      toast.error('Gagal', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

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
      await submitLiveness(appId, base64, transactionId);
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
        bank_name: formData.bankAccount.bankName,
        bank_code: formData.bankAccount.bankName,
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
      clearSession();
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

  const handleNext = () => {
    switch (currentStep) {
      case 0: return handleAgreementNext();
      case 1: return handleProductNext();
      case 3: return handlePersonalInfoNext();
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
          <ProductSelectionStep
            product={formData.product}
            initialDeposit={formData.initialDeposit}
            sourceOfFund={formData.sourceOfFund}
            purposeOfSaving={formData.purposeOfSaving}
            onChange={(data) => setFormData({ ...formData, ...data })}
          />
        );

      case 2:
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
        return phoneVerified ? (
          <LivenessVerification
            appId={appId}
            initialSelfie={formData.selfieImage}
            ktpImage={formData.ktpImage}
            onComplete={handleLivenessComplete}
            onError={handleLivenessError}
          />
        ) : (
          <OTPVerification
            appId={appId}
            phone={formData.additionalData.nomorHandphone}
            onVerified={() => setPhoneVerified(true)}
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

  const showNextButton =
    currentStep < steps.length - 1 &&
    currentStep !== 2 &&  // KtpOcrUpload handle sendiri
    currentStep !== 4;    // LivenessVerification handle sendiri

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold text-center mb-8">
            {t('tabungan.formTitle')}
          </h1>

          {hasResume && (
            <ResumeSessionBanner
              stepLabel={resumeStepLabel}
              onResume={confirmResume}
              onStartOver={dismissResume}
            />
          )}

          <Stepper steps={steps} currentStep={currentStep} />

          <Card className="p-6 md:p-8 mt-8">
            {renderStep()}
          </Card>

          {stepError && (
            <div className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {stepError}
            </div>
          )}

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
                    {currentStep === steps.length - 1
                      ? t('actions.submit')
                      : t('actions.next')}
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