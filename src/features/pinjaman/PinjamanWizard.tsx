import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Stepper } from '@/components/Stepper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { LoanProduct, LoanTenor, AdditionalData, KtpOcrData } from '@/types/domain';
import { AgreementStep } from '@/features/deposito/steps/AgreementStep';
import { AdditionalDataStep } from '@/features/deposito/steps/AdditionalDataStep';
import { LoanInfoStep } from './steps/LoanInfoStep';
import { CollateralStep } from './steps/CollateralStep';
import { SummaryStep } from './steps/SummaryStep';
import { KtpOcrUpload } from '@/features/ekyc/KtpOcrUpload';
import { LivenessCapture } from '@/features/ekyc/LivenessCapture';

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
  additionalData: AdditionalData;
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
};

export default function PinjamanWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PinjamanFormData>(initialFormData);

  const steps = [
    { label: t('pinjaman.step1') },
    { label: t('pinjaman.step2') },
    { label: t('pinjaman.step3') },
    { label: t('pinjaman.step4') },
    { label: t('pinjaman.step5') },
    { label: t('pinjaman.step6') },
    { label: t('pinjaman.step7') },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.agreement;
      case 1:
        return formData.loanAmount > 0 && formData.purposeOfLoan && formData.sourceOfFund;
      case 2:
        return (
          formData.collateralType &&
          formData.collateralValue > 0 &&
          formData.collateralOwnership &&
          formData.collateralImages.length > 0
        );
      case 3:
        return formData.ktpData !== null;
      case 4:
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
      case 5:
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
          <LoanInfoStep
            data={{
              product: formData.product,
              loanAmount: formData.loanAmount,
              loanTenor: formData.loanTenor,
              purposeOfLoan: formData.purposeOfLoan,
              sourceOfFund: formData.sourceOfFund,
            }}
            onChange={(data) => setFormData({ ...formData, ...data })}
          />
        );
      case 2:
        return (
          <CollateralStep
            data={{
              type: formData.collateralType,
              value: formData.collateralValue,
              ownership: formData.collateralOwnership,
              description: formData.collateralDescription,
              images: formData.collateralImages,
            }}
            loanAmount={formData.loanAmount}
            onChange={(data) =>
              setFormData({
                ...formData,
                collateralType: data.type,
                collateralValue: data.value,
                collateralOwnership: data.ownership,
                collateralDescription: data.description,
                collateralImages: data.images,
              })
            }
          />
        );
      case 3:
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
      case 4:
        return (
          <AdditionalDataStep
            data={formData.additionalData}
            onChange={(additionalData) => setFormData({ ...formData, additionalData })}
          />
        );
      case 5:
        return (
          <LivenessCapture
            initialImage={formData.selfieImage}
            onComplete={(selfieImage) => {
              setFormData({ ...formData, selfieImage });
              handleNext();
            }}
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
          <h1 className="text-3xl font-bold text-center mb-8">{t('pinjaman.formTitle')}</h1>
          <Stepper steps={steps} currentStep={currentStep} />

          <Card className="p-6 md:p-8 mt-8">{renderStep()}</Card>

          <div className="flex gap-4 mt-6">
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('actions.back')}
            </Button>

            {currentStep < steps.length - 1 && currentStep !== 3 && currentStep !== 5 && (
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
