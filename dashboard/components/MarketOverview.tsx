import { MarketDataDoc } from '@/lib/queries';
import { ATH_REFERENCE, calculateCorrection, formatPct, getCorrectionColor } from '@/lib/utils';

interface MarketOverviewProps {
  data: MarketDataDoc | null;
}

export default function MarketOverview({ data }: MarketOverviewProps) {
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">Aucune donnee disponible</div>
      </div>
    );
  }

  const correctionPct = calculateCorrection(data.brvm_composite);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Indices Principaux</h3>
        <span className="text-sm text-gray-500">{data.date} {data.time}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">BRVM Composite</div>
          <div className="text-3xl font-bold">{data.brvm_composite.toFixed(2)}</div>
          <div className={`text-sm ${data.variation_jour >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPct(data.variation_jour)} jour
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Correction / ATH</div>
          <div className={`text-3xl font-bold ${getCorrectionColor(correctionPct)}`}>
            {formatPct(correctionPct)}
          </div>
          <div className="text-sm text-gray-500">ATH: {ATH_REFERENCE} pts</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">BRVM 30</div>
          <div className="text-3xl font-bold">{data.brvm_30 > 0 ? data.brvm_30.toFixed(2) : 'N/D'}</div>
        </div>
      </div>
    </div>
  );
}
