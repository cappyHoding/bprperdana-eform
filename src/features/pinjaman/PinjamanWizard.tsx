/**
 * PinjamanWizard.tsx
 *
 * MAPPING STEP → BACKEND:
 *   Step 0 (Agreement)     → POST /applications/agree
 *   Step 1 (Loan Info)     → POST /applications
 *   Step 2 (Collateral)    → 
 *   Step 3 (KTP OCR)       → POST /applications/:id/ocr
 *   Step 4 (Personal Info) → PATCH /applications/:id/personal-info
 *   Step 5 (Liveness)      → GET liveness/token → SDK → POST liveness
 *   Step 6 (Bank Account)  → PATCH /applications/:id/disbursement
 *   Step 7 (Summary)       → POST /applications/:id/submit
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

import { LoanProduct, LoanTenor, AdditionalData, BankAccount } from '@/types/domain';
import { KtpOcrData } from '@/types/api';
import { getApplicationId, clearSession } from '@/lib/session';
import {
  acceptAgreement,
  createApplication,
  updatePersonalInfo,
  submitLiveness,
  updateDisbursement,
  updateCollateral,
  submitApplication,
} from '@/lib/api/applicationApi';

import { AgreementStep } from '@/features/deposito/steps/AgreementStep';
import { AdditionalDataStep } from '@/features/deposito/steps/AdditionalDataStep';
import { BankAccountStep } from '@/features/deposito/steps/BankAccountStep';
import { LoanInfoStep } from './steps/LoanInfoStep';
import { CollateralStep } from './steps/CollateralStep';
import { SummaryStep } from './steps/SummaryStep';
import { KtpOcrUpload } from '@/features/ekyc/KtpOcrUpload';
import { LivenessVerification } from '@/features/ekyc';

import { useResumeSession } from '@/hooks/useResumeSession';
import { ResumeSessionBanner } from '@/components/ResumeSessionBanner';

interface PinjamanFormData {
  agreement: boolean;
  product: LoanProduct;
  loanAmount: number;
  loanTenor: LoanTenor;
  purposeOfLoan: string;
  sourceOfFund: string;
  collateralType: string;
  collateralValue: number;
  collateralOwnership: string;
  collateralDescription: string;
  collateralImages: string[];
  ktpData: KtpOcrData | null;
  ktpImage: string | null;
  selfieImage: string | null;
  livenessTransactionId: string | null;
  additionalData: AdditionalData;
  bankAccount: BankAccount;
}

const initialFormData: PinjamanFormData = {
  agreement: false,
  product: 'KreditModalKerja',
  loanAmount: 0,
  loanTenor: 12,
  purposeOfLoan: '',
  sourceOfFund: '',
  collateralType: '',
  collateralValue: 0,
  collateralOwnership: '',
  collateralDescription: '',
  collateralImages: [],
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

const productNameMap: Record<LoanProduct, string> = {
  KreditModalKerja: 'Kredit Modal Kerja',
  KreditAnekaGuna: 'Kredit Aneka Guna',
};

export default function PinjamanWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PinjamanFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const { hasResume, resumeStep, confirmResume, dismissResume } = useResumeSession(
    'LOAN',
    (step) => setCurrentStep(step),
  );


  const steps = [
    { label: t('pinjaman.step1') }, // Agreement
    { label: t('pinjaman.step2') }, // Loan Info
    { label: t('pinjaman.step3') }, // Collateral
    { label: t('pinjaman.step4') }, // KTP OCR
    { label: t('pinjaman.step5') }, // Personal Info
    { label: t('pinjaman.step6') }, // Liveness
    { label: t('pinjaman.step7') }, // Bank Account
    { label: t('pinjaman.step8') }, // Summary
  ];

  const resumeStepLabel = steps[resumeStep]?.label ?? '';

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: return formData.agreement;
      case 1: return formData.loanAmount > 0 && !!formData.purposeOfLoan && !!formData.sourceOfFund;
      case 2:
        return (
          !!formData.collateralType &&
          formData.collateralValue > 0 &&
          !!formData.collateralOwnership &&
          formData.collateralImages.length > 0
        );
      case 3: return formData.ktpData !== null;
      case 4:
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
      case 5: return formData.selfieImage !== null;
      case 6:
        return (
          !!formData.bankAccount.bankName &&
          !!formData.bankAccount.accountNumber &&
          !!formData.bankAccount.accountHolderName
        );
      default: return true;
    }
  };

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

  const handleAgreementNext = async () => {
    setSubmitting(true); setStepError(null);
    try { await acceptAgreement(); goNext(); }
    catch (err: any) { setStepError(err.message); toast.error('Gagal', { description: err.message }); }
    finally { setSubmitting(false); }
  };

  const handleLoanInfoNext = async () => {
    setSubmitting(true); setStepError(null);
    try {
      await createApplication({
        product_type: 'LOAN',
        loan: {
          product_name: productNameMap[formData.product],
          requested_amount: formData.loanAmount,
          tenor_months: formData.loanTenor,
          loan_purpose: formData.purposeOfLoan,
          payment_source: formData.sourceOfFund,
          source_of_funds: formData.sourceOfFund,
        },
      });
      goNext();
    } catch (err: any) { setStepError(err.message); toast.error('Gagal', { description: err.message }); }
    finally { setSubmitting(false); }
  };

  const handleCollaterralNext = async () => {
    const appId = getApplicationId();
    if (!appId) { setStepError('Session Tidak Ditemukan.'); return; }

    setSubmitting(true);
    setStepError(null);
    try {
      await updateCollateral(appId, [
        {
          collateral_type: formData.collateralType,
          estimated_value: formData.collateralValue,
          ownership_status: formData.collateralOwnership,
          description: formData.collateralDescription || undefined,
        },
      ]);
      goNext();
    } catch (err: any) {
      setStepError(err.message || 'Gagal menyimpan data agunan.');
      toast.error('Gagal', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  const handleOcrComplete = (ktpData: any, ktpImage: string) => {
    setFormData((prev) => ({ ...prev, ktpData, ktpImage }));
    goNext();
  };

  const handlePersonalInfoNext = async () => {
    const appId = getApplicationId();
    if (!appId) { setStepError('Session tidak ditemukan.'); return; }
    setSubmitting(true); setStepError(null);
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
    } catch (err: any) { setStepError(err.message); toast.error('Gagal', { description: err.message }); }
    finally { setSubmitting(false); }
  };

  const handleLivenessComplete = async (selfieImage: string, transactionId?: string) => {
    const appId = getApplicationId();
    if (!appId) { setStepError('Session tidak ditemukan.'); return; }
    setFormData((prev) => ({ ...prev, selfieImage, livenessTransactionId: transactionId || null }));
    setSubmitting(true); setStepError(null);
    try {
      const base64 = selfieImage.includes(',') ? selfieImage.split(',')[1] : selfieImage;
      await submitLiveness(appId, base64, transactionId);
      goNext();
    } catch (err: any) { setStepError(err.message); toast.error('Verifikasi gagal', { description: err.message }); }
    finally { setSubmitting(false); }
  };

  const handleDisbursementNext = async () => {
    const appId = getApplicationId();
    if (!appId) { setStepError('Session tidak ditemukan.'); return; }
    setSubmitting(true); setStepError(null);
    try {
      await updateDisbursement(appId, {
        bank_name: formData.bankAccount.bankName,
        bank_code: formData.bankAccount.bankName,
        account_number: formData.bankAccount.accountNumber,
        account_holder: formData.bankAccount.accountHolderName,
      });
      goNext();
    } catch (err: any) { setStepError(err.message); toast.error('Gagal', { description: err.message }); }
    finally { setSubmitting(false); }
  };

  const handleNext = () => {
    switch (currentStep) {
      case 0: return handleAgreementNext();
      case 1: return handleLoanInfoNext();
      case 2: return handleCollaterralNext();
      case 4: return handlePersonalInfoNext();
      case 6: return handleDisbursementNext();
      default: goNext();
    }
  };

  const renderStep = () => {
    const appId = getApplicationId() ?? '';
    switch (currentStep) {
      case 0:
        return <AgreementStep agreed={formData.agreement} onAgree={(v) => setFormData({ ...formData, agreement: v })} />;
      case 1:
        return (
          <LoanInfoStep
            data={{ product: formData.product, loanAmount: formData.loanAmount, loanTenor: formData.loanTenor, purposeOfLoan: formData.purposeOfLoan, sourceOfFund: formData.sourceOfFund }}
            onChange={(data) => setFormData({ ...formData, ...data })}
          />
        );
      case 2:
        return (
          <CollateralStep
            data={{ type: formData.collateralType, value: formData.collateralValue, ownership: formData.collateralOwnership, description: formData.collateralDescription, images: formData.collateralImages }}
            loanAmount={formData.loanAmount}
            onChange={(data) => setFormData({ ...formData, collateralType: data.type, collateralValue: data.value, collateralOwnership: data.ownership, collateralDescription: data.description, collateralImages: data.images })}
          />
        );
      case 3:
        return (
          <KtpOcrUpload
            appId={appId}
            initialData={formData.ktpData}
            initialImage={formData.ktpImage}
            onComplete={handleOcrComplete}
            onError={(err) => { setStepError(err); toast.error('OCR gagal', { description: err }); }}
          />
        );
      case 4:
        return <AdditionalDataStep data={formData.additionalData} onChange={(additionalData) => setFormData({ ...formData, additionalData })} />;
      case 5:
        return (
          <LivenessVerification
            appId={appId}
            initialSelfie={formData.selfieImage}
            ktpImage={formData.ktpImage}
            onComplete={handleLivenessComplete}
            onError={(err) => { setStepError(err); toast.error('Liveness gagal', { description: err }); }}
          />
        );
      case 6:
        return <BankAccountStep data={formData.bankAccount} onChange={(bankAccount) => setFormData({ ...formData, bankAccount })} />;
      case 7:
        return <SummaryStep formData={formData} />;
      default:
        return null;
    }
  };

  const showNextButton = currentStep < steps.length - 1 && currentStep !== 3 && currentStep !== 5;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold text-center mb-8">{t('pinjaman.formTitle')}</h1>

          {hasResume && (
            <ResumeSessionBanner
              stepLabel={resumeStepLabel}
              onResume={confirmResume}
              onStartOver={dismissResume}
            />
          )}

          <Stepper steps={steps} currentStep={currentStep} />
          <Card className="p-6 md:p-8 mt-8">{renderStep()}</Card>
          {stepError && (
            <div className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{stepError}</div>
          )}
          <div className="flex gap-4 mt-6">
            <Button variant="outline" onClick={handleBack} disabled={submitting} className="gap-2">
              <ArrowLeft className="w-4 h-4" />{t('actions.back')}
            </Button>
            {showNextButton && (
              <Button onClick={handleNext} disabled={!canProceed() || submitting} className="ml-auto gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{t('actions.next')}<ArrowRight className="w-4 h-4" /></>}
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}