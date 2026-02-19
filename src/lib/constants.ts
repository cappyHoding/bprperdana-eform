import { DepositoTenor } from '@/types/domain';

export const DEPOSITO_RATES: Record<DepositoTenor, number> = {
  1: 2.75,
  3: 4.50,
  6: 5.25,
  12: 5.25,
};

export const DEPOSITO_MIN_AMOUNT = 1_000_000;
export const DEPOSITO_TAX_THRESHOLD = 7_500_000;

export const TABUNGAN_PRODUCTS = {
  Perdana: {
    rate: 0.0,
    minFirst: 50_000,
    minNext: 20_000,
    holdMin: 50_000,
    closeFee: 20_000,
  },
  PerdanaPlus: {
    rate: 0.2,
    minFirst: 100_000,
    minNext: 20_000,
    holdMin: 100_000,
    closeFee: 20_000,
    points: '1 poin/ Rp100.000',
  },
  TabunganKu: {
    rate: 0.1,
    minFirst: 50_000,
    minNext: 20_000,
    holdMin: 50_000,
    closeFee: 20_000,
  },
} as const;

export const LOAN_PRODUCTS = {
  KreditModalKerja: {
    rateMonthly: 1.90,
    max: 2_000_000_000,
    maxYears: 5,
    collateral: 'SHM, SHGB, BPKB',
  },
  KreditAnekaGuna: {
    rateMonthly: 1.85,
    max: 1_000_000_000,
    maxYears: 5,
    collateral: 'SHM, SHGB, BPKB',
  },
} as const;

export const SOURCE_OF_FUNDS = [
  'Gaji/Upah',
  'Hasil Usaha',
  'Investasi',
  'Warisan',
  'Hibah/Donasi',
  'Pensiun',
  'Lainnya',
] as const;

export const PLACEMENT_PURPOSES = [
  'Investasi Jangka Panjang',
  'Dana Darurat',
  'Tabungan Pendidikan',
  'Tabungan Hari Tua',
  'Modal Usaha',
  'Rencana Pembelian Aset',
  'Lainnya',
] as const;

export const LOAN_PURPOSES = [
  'Modal Kerja Usaha',
  'Ekspansi Usaha',
  'Pembelian Inventori',
  'Renovasi Tempat Usaha',
  'Pembelian Kendaraan',
  'Renovasi Rumah',
  'Pendidikan',
  'Kesehatan',
  'Lainnya',
] as const;

export const OCCUPATIONS = [
  'Karyawan Swasta',
  'Pegawai Negeri Sipil (PNS)',
  'TNI/POLRI',
  'Wiraswasta',
  'Pedagang',
  'Petani',
  'Nelayan',
  'Profesional (Dokter, Pengacara, dll)',
  'Ibu Rumah Tangga',
  'Pelajar/Mahasiswa',
  'Pensiunan',
  'Lainnya',
] as const;

export const EDUCATION_LEVELS = [
  'SD',
  'SMP',
  'SMA/SMK',
  'D3',
  'S1',
  'S2',
  'S3',
] as const;

export const INDONESIAN_BANKS = [
  'Bank BCA',
  'Bank Mandiri',
  'Bank BRI',
  'Bank BNI',
  'Bank BTN',
  'Bank CIMB Niaga',
  'Bank Danamon',
  'Bank Permata',
  'Bank Mega',
  'Bank Panin',
  'Bank OCBC NISP',
  'Bank Maybank',
  'Bank Sinarmas',
  'Bank BII Maybank',
  'Bank Bukopin',
  'Bank Syariah Indonesia (BSI)',
  'Bank Muamalat',
  'Bank BJB',
  'Bank Jateng',
  'Bank Jatim',
  'Lainnya',
] as const;
