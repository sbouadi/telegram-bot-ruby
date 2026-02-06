export const ATH_REFERENCE = parseFloat(process.env.ATH_REFERENCE || '362.09');
export const ATH_DATE = '2026-01-29';

export interface TriggerAction {
  type: 'BUY' | 'HOLD' | 'SELL';
  instrument: string;
  amount: number;
  currency: string;
  targets?: string[];
}

export interface CorrectionTrigger {
  name: string;
  threshold: number;
  target_points: number;
  action: TriggerAction;
  alert_priority: 'HIGH' | 'URGENT' | 'CRITICAL';
  expert_context: string;
}

export const CORRECTION_TRIGGERS: CorrectionTrigger[] = [
  {
    name: 'TRANCHE_1',
    threshold: -10.0,
    target_points: +(ATH_REFERENCE * 0.90).toFixed(2),
    action: {
      type: 'BUY',
      instrument: 'TAWFIR_HALAL',
      amount: 250_000,
      currency: 'FCFA',
    },
    alert_priority: 'HIGH',
    expert_context: 'correction_douce',
  },
  {
    name: 'TRANCHE_2',
    threshold: -15.0,
    target_points: +(ATH_REFERENCE * 0.85).toFixed(2),
    action: {
      type: 'BUY',
      instrument: 'TAWFIR_HALAL',
      amount: 300_000,
      currency: 'FCFA',
    },
    alert_priority: 'URGENT',
    expert_context: 'correction_moderee',
  },
  {
    name: 'TRANCHE_3',
    threshold: -25.0,
    target_points: +(ATH_REFERENCE * 0.75).toFixed(2),
    action: {
      type: 'BUY',
      instrument: 'ACTIONS_DIRECTES',
      amount: 250_000,
      currency: 'FCFA',
      targets: ['SNTS', 'BOAM', 'SPHC'],
    },
    alert_priority: 'CRITICAL',
    expert_context: 'correction_majeure',
  },
];

export const UEMOA_HOLIDAYS_2026 = [
  '2026-01-01',
  '2026-04-06',
  '2026-05-01',
  '2026-05-14',
  '2026-05-25',
  '2026-08-15',
  '2026-11-01',
  '2026-12-25',
];

export function isTradingDay(date: Date): boolean {
  const day = date.getDay();
  const dateStr = date.toISOString().split('T')[0];
  return day !== 0 && day !== 6 && !UEMOA_HOLIDAYS_2026.includes(dateStr);
}
