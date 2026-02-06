import { getCorrectionColor } from '@/lib/utils';

interface CorrectionGaugeProps {
  current: number;
  ath: number;
}

export default function CorrectionGauge({ current, ath }: CorrectionGaugeProps) {
  const correctionPct = current > 0 ? ((current - ath) / ath) * 100 : 0;
  const colorClass = getCorrectionColor(correctionPct);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Correction depuis ATH</h3>

      <div className="flex flex-col items-center py-4">
        <div className={`text-5xl font-bold ${colorClass}`}>
          {correctionPct.toFixed(2)}%
        </div>
        <div className="text-sm text-gray-500 mt-2">
          {current > 0 ? current.toFixed(2) : '---'} / {ath} pts
        </div>
      </div>

      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              correctionPct > -5 ? 'bg-green-500' :
              correctionPct > -10 ? 'bg-yellow-500' :
              correctionPct > -15 ? 'bg-orange-500' :
              'bg-red-500'
            }`}
            style={{ width: `${Math.max(0, Math.min(100, 100 + correctionPct * 3))}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>-10%</span>
          <span>-15%</span>
          <span>-25%</span>
        </div>
      </div>
    </div>
  );
}
