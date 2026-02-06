'use client';

import { useEffect, useState } from 'react';
import { getConfig } from '@/lib/queries';
import { ATH_REFERENCE, TRIGGERS, formatFCFA } from '@/lib/utils';

export default function SettingsPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getConfig();
        setConfig(data);
      } catch (error) {
        console.error('Error fetching config:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configuration</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Reference Marche</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">ATH Reference</label>
            <div className="text-lg font-bold">{config?.ath_reference || ATH_REFERENCE} points</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Date ATH</label>
            <div className="text-lg font-bold">{config?.ath_date || '29 Janvier 2026'}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Configuration Triggers</h2>
        <div className="space-y-4">
          {TRIGGERS.map((trigger) => (
            <div key={trigger.name} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{trigger.name}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">ACTIF</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Seuil:</span> {trigger.threshold}%
                </div>
                <div>
                  <span className="text-gray-500">Cible:</span> {trigger.target} pts
                </div>
                <div>
                  <span className="text-gray-500">Montant:</span> {formatFCFA(trigger.amount)}
                </div>
                <div>
                  <span className="text-gray-500">Instrument:</span> {trigger.instrument}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Alertes</h2>
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-600">Email destinataire</label>
            <div className="text-gray-900">{config?.alert_email || 'serge.bouadi@protonmail.com'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Statut</label>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">ACTIF</span>
          </div>
        </div>
      </div>
    </div>
  );
}
