import { TRIGGERS, formatFCFA } from '@/lib/utils';

interface TriggerIndicatorsProps {
  currentLevel: number;
}

export default function TriggerIndicators({ currentLevel }: TriggerIndicatorsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Etat des Triggers</h3>

      <div className="space-y-3">
        {TRIGGERS.map((trigger) => {
          const isActive = currentLevel > 0 && currentLevel <= trigger.target;

          return (
            <div
              key={trigger.name}
              className={`p-4 rounded-lg border-2 ${
                isActive
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{trigger.name}</span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {isActive ? 'ACTIF' : 'EN ATTENTE'}
                </span>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <div>Seuil: {trigger.threshold}%</div>
                <div>Cible: {trigger.target} points</div>
                <div>Montant: {formatFCFA(trigger.amount)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
