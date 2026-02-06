'use client';

import { useEffect, useState } from 'react';
import { getAlerts, AlertDoc } from '@/lib/queries';
import AlertList from '@/components/AlertList';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAlerts(50);
        setAlerts(data);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Historique Alertes</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <AlertList alerts={alerts} />
        {alerts.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Aucune alerte declenchee
          </div>
        )}
      </div>
    </div>
  );
}
