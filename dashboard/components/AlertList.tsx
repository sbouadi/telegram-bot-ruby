import { AlertDoc } from '@/lib/queries';
import { formatFCFA } from '@/lib/utils';

interface AlertListProps {
  alerts: AlertDoc[];
}

export default function AlertList({ alerts }: AlertListProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg border-l-4 ${
            alert.trigger_name === 'TRANCHE_3'
              ? 'border-red-500 bg-red-50'
              : alert.trigger_name === 'TRANCHE_2'
              ? 'border-orange-500 bg-orange-50'
              : 'border-yellow-500 bg-yellow-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{alert.trigger_name}</span>
              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  alert.status === 'SENT'
                    ? 'bg-green-100 text-green-800'
                    : alert.status === 'FAILED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {alert.status}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {alert.timestamp?.toDate?.()
                ? alert.timestamp.toDate().toLocaleDateString('fr-FR')
                : ''}
            </span>
          </div>

          <div className="text-sm text-gray-700">
            <div>
              BRVM: <strong>{alert.brvm_composite?.toFixed(2)}</strong> pts |
              Correction: <strong>{alert.correction_pct}%</strong>
            </div>
            <div className="mt-1">
              Action: {alert.action?.type} {alert.action?.instrument} -{' '}
              {alert.action?.amount ? formatFCFA(alert.action.amount) : ''}
            </div>
          </div>

          {alert.recommendation && (
            <div className="mt-2 text-sm text-gray-600 italic">
              {alert.recommendation.substring(0, 150)}
              {alert.recommendation.length > 150 ? '...' : ''}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
