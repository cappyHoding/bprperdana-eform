import { DepositoTenor } from '@/types/domain';
import { DEPOSITO_TAX_THRESHOLD } from './constants';

export function depositoSimulation(
  principal: number,
  tenorMonths: DepositoTenor,
  rateAnnualPct: number
) {
  const grossInterest = principal * (rateAnnualPct / 100) * (tenorMonths / 12);
  const taxable = principal >= DEPOSITO_TAX_THRESHOLD;
  const interestTax = taxable ? 0.2 * grossInterest : 0;
  const netInterest = grossInterest - interestTax;
  const maturityValue = principal + netInterest;
  const earlyWithdrawalValue = principal - principal * 0.1;
  
  return {
    grossInterest,
    interestTax,
    netInterest,
    maturityValue,
    earlyWithdrawalValue,
  };
}

export function tabunganMonthly(balance: number, rateAnnualPct: number) {
  const monthlyInterest = (balance * (rateAnnualPct / 100)) / 12;
  const projectedBalanceMonth1 = balance + monthlyInterest;
  return { monthlyInterest, projectedBalanceMonth1 };
}

export function loanFlat(
  loanAmount: number,
  tenor: number,
  rateMonthlyPct: number
) {
  const monthlyInterestFlat = loanAmount * (rateMonthlyPct / 100);
  const monthlyInstallmentFlat = loanAmount / tenor + monthlyInterestFlat;
  const totalPayableFlat = monthlyInstallmentFlat * tenor;
  return { monthlyInstallmentFlat, totalPayableFlat };
}

export function loanAmortized(
  loanAmount: number,
  tenor: number,
  rateAnnualPct: number
) {
  const r = rateAnnualPct / 100 / 12;
  const factor = Math.pow(1 + r, tenor);
  const monthlyInstallmentAmortized = (loanAmount * r * factor) / (factor - 1);
  const totalPayableAmortized = monthlyInstallmentAmortized * tenor;
  return { monthlyInstallmentAmortized, totalPayableAmortized };
}

export function ltv(loanAmount: number, collateralValue: number) {
  return (loanAmount / collateralValue) * 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}
