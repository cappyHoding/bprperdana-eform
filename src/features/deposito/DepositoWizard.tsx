import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Stepper } from '@/components/Stepper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { DepositoFormData } from '@/types/domain';
import { AgreementStep } from './steps/AgreementStep';
import { PlacementInfoStep } from './steps/PlacementInfoStep';
import { AdditionalDataStep } from './steps/AdditionalDataStep';
import { BankAccountStep } from './steps/BankAccountStep';
import { SummaryStep } from './steps/SummaryStep';
import { KtpOcrUpload } from '@/features/ekyc/KtpOcrUpload';
import { LivenessCapture } from '@/features/ekyc/LivenessCapture';
import { LivenessVerification } from "@/features/ekyc";

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

export default function DepositoWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<DepositoFormData>(initialFormData);

  const steps = [
    { label: t('deposito.step1') },
    { label: t('deposito.step2') },
    { label: t('deposito.step3') },
    { label: t('deposito.step4') },
    { label: t('deposito.step5') },
    { label: t('deposito.step6') },
    { label: t('deposito.step7') },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.agreement;
      case 1:
        return formData.info.amount >= 1000000 && formData.info.sourceOfFund && formData.info.placementPurpose;
      case 2:
        return formData.ktpData !== null;
      case 3:
        return (
          formData.additionalData.alamatTinggal &&
          formData.additionalData.pekerjaan &&
          formData.additionalData.lamaBekerjaUsaha &&
          formData.additionalData.penghasilanPerbulan > 0 &&
          formData.additionalData.namaIbuKandung &&
          formData.additionalData.pendidikanTerakhir &&
          formData.additionalData.email &&
          formData.additionalData.nomorHandphone &&
          formData.additionalData.alamatUsaha
        );
      case 4:
        return formData.livenessData !== null;
      case 5:
        return (
          formData.bankAccount.bankName &&
          formData.bankAccount.accountNumber &&
          formData.bankAccount.accountHolderName
        );
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleLivenessComplete = (selfieImage: string, transactionId?: string) => {
    console.log('Liveness Verification Complete:', { transactionId });

    setFormData({
      ...formData,
      selfieImage,
      livenessTransactionId: transactionId || null,
    });

    // Auto proceed to next step
    handleNext();
  };

  const handleLivenessError = (error: string) => {
    console.error('❌ Liveness Verification Error:', error);
  };

  const renderStep = () => {
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
        return (
          <KtpOcrUpload
            initialData={formData.ktpData}
            initialImage={formData.ktpImage}
            onComplete={(ktpData, ktpImage) => {
              setFormData({ ...formData, ktpData, ktpImage });
              handleNext();
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
        return (
            <LivenessVerification
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
        return <SummaryStep formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold text-center mb-8">{t('deposito.formTitle')}</h1>
          <Stepper steps={steps} currentStep={currentStep} />
          
          <Card className="p-6 md:p-8 mt-8">
            {renderStep()}
          </Card>

          <div className="flex gap-4 mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('actions.back')}
            </Button>
            
            {currentStep < steps.length - 1 && currentStep !== 2 && currentStep !== 4 && (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="ml-auto gap-2"
              >
                {t('actions.next')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
