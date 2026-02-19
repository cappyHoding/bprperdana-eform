import {KtpOcrData, VidaLivenessSubmitData} from "./api.ts"

export type Language = 'id' | 'en';

export interface AdditionalData {
  alamatTinggal: string;
  pekerjaan: string;
  lamaBekerjaUsaha: string;
  penghasilanPerbulan: number;
  namaIbuKandung: string;
  pendidikanTerakhir: string;
  email: string;
  nomorHandphone: string;
  alamatUsaha: string;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
}

// Deposito
export type DepositoTenor = 1 | 3 | 6 | 12;
export type AroType = 'aro' | 'aroRate' | 'nonAro';

export interface DepositoInfo {
  amount: number;
  tenor: DepositoTenor;
  aroType: AroType;
  sourceOfFund: string;
  placementPurpose: string;
}

export interface DepositoSimulation {
  grossInterest: number;
  interestTax: number;
  netInterest: number;
  maturityValue: number;
  earlyWithdrawalValue: number;
}

export interface DepositoFormData {
  agreement: boolean;
  info: DepositoInfo;
  ktpData: KtpOcrData | null;
  ktpImage: string | null;
  selfieImage: string | null;
  livenessData: VidaLivenessSubmitData | null;
  livenessTransactionId: string | null;
  additionalData: AdditionalData;
  bankAccount: BankAccount;
}

// Tabungan
export type TabunganProduct = 'Perdana' | 'PerdanaPlus' | 'TabunganKu';

export interface TabunganInfo {
  product: TabunganProduct;
  initialDeposit: number;
  sourceOfFund: string;
  purposeOfSaving: string;
}

export interface TabunganSimulation {
  monthlyInterest: number;
  projectedBalanceMonth1: number;
}

// Pinjaman
export type LoanProduct = 'KreditModalKerja' | 'KreditAnekaGuna';
export type LoanTenor = 6 | 12 | 18 | 24 | 36 | 48 | 60;

export interface LoanInfo {
  product: LoanProduct;
  loanAmount: number;
  loanTenorMonths: LoanTenor;
  purposeOfLoan: string;
  sourceOfFund: string;
}

export interface CollateralInfo {
  type: string;
  value: number;
  ownershipStatus: string;
  description?: string;
  uploads: string[];
}

export interface LoanSimulation {
  monthlyInstallmentFlat: number;
  totalPayableFlat: number;
  monthlyInstallmentAmortized: number;
  totalPayableAmortized: number;
  ltvPercent: number;
}
