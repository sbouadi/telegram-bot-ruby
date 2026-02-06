export const ATH_REFERENCE = 362.09;
export const ATH_DATE = '2026-01-29';

export function calculateCorrection(currentLevel: number): number {
  return ((currentLevel - ATH_REFERENCE) / ATH_REFERENCE) * 100;
}

export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

export function formatPct(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

export function getCorrectionColor(pct: number): string {
  if (pct > -5) return 'text-green-500';
  if (pct > -10) return 'text-yellow-500';
  if (pct > -15) return 'text-orange-500';
  return 'text-red-500';
}

export const TRIGGERS = [
  { name: 'TRANCHE_1', threshold: -10, target: +(ATH_REFERENCE * 0.9).toFixed(2), amount: 250000, instrument: 'TAWFIR_HALAL' },
  { name: 'TRANCHE_2', threshold: -15, target: +(ATH_REFERENCE * 0.85).toFixed(2), amount: 300000, instrument: 'TAWFIR_HALAL' },
  { name: 'TRANCHE_3', threshold: -25, target: +(ATH_REFERENCE * 0.75).toFixed(2), amount: 250000, instrument: 'ACTIONS_DIRECTES' },
];
