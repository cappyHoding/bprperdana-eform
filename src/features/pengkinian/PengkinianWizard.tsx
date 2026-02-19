import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Stepper } from '@/components/Stepper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { KtpOcrData } from '@/types/domain';
import { AgreementStep } from '@/features/deposito/steps/AgreementStep';
import { AccountIdentityStep } from './steps/AccountIdentityStep';
import { SummaryStep } from './steps/SummaryStep';
import { KtpOcrUploadPengkinian } from '@/features/ekyc/KtpOcrUploadPengkinian';
import { LivenessCapture } from '@/features/ekyc/LivenessCapture';

interface PengkinianFormData {
  agreement: boolean;
  accountNumber: string;
  identityNumber: string;
  ktpData: KtpOcrData | null;
  ktpImage: string | null;
  selfieImage: string | null;
  updatedData: {
    nama: string;
    alamat: string;
    pekerjaan: string;
    phone: string;
    email: string;
  };
}

const initialFormData: PengkinianFormData = {
  agreement: false,
  accountNumber: '',
  identityNumber: '',
  ktpData: null,
  ktpImage: null,
  selfieImage: null,
  updatedData: {
    nama: '',
    alamat: '',
    pekerjaan: '',
    phone: '',
    email: '',
  },
};

export default function PengkinianWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PengkinianFormData>(initialFormData);

  const steps = [
    { label: t('pengkinian.step1') },
    { label: t('pengkinian.step2') },
    { label: t('pengkinian.step3') },
    { label: t('pengkinian.step4') },
    { label: t('pengkinian.step5') },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.agreement;
      case 1:
        return formData.accountNumber && formData.identityNumber;
      case 2:
        return formData.ktpData !== null && formData.updatedData.nama;
      case 3:
        return formData.selfieImage !== null;
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
          <AccountIdentityStep
            accountNumber={formData.accountNumber}
            identityNumber={formData.identityNumber}
            onChange={(data) => setFormData({ ...formData, ...data })}
          />
        );
      case 2:
        return (
          <KtpOcrUploadPengkinian
            initialData={formData.ktpData}
            initialUpdatedData={formData.updatedData}
            initialImage={formData.ktpImage}
            onComplete={(ktpData, updatedData, ktpImage) => {
              setFormData({
                ...formData,
                ktpData,
                ktpImage,
                updatedData,
              });
              handleNext();
            }}
          />
        );
      case 3:
        return (
          <LivenessCapture
            initialImage={formData.selfieImage}
            onComplete={(selfieImage) => {
              setFormData({ ...formData, selfieImage });
              handleNext();
            }}
          />
        );
      case 4:
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
          <h1 className="text-3xl font-bold text-center mb-8">{t('pengkinian.formTitle')}</h1>
          <Stepper steps={steps} currentStep={currentStep} />

          <Card className="p-6 md:p-8 mt-8">{renderStep()}</Card>

          <div className="flex gap-4 mt-6">
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('actions.back')}
            </Button>

            {currentStep < steps.length - 1 && currentStep !== 2 && currentStep !== 3 && (
              <Button onClick={handleNext} disabled={!canProceed()} className="ml-auto gap-2">
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
