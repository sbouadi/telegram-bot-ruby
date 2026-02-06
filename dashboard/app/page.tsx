'use client';

import { useEffect, useState } from 'react';
import { getLatestMarketData, getAlerts, MarketDataDoc, AlertDoc } from '@/lib/queries';
import { ATH_REFERENCE, calculateCorrection } from '@/lib/utils';
import CorrectionGauge from '@/components/CorrectionGauge';
import TriggerIndicators from '@/components/TriggerIndicators';
import MarketOverview from '@/components/MarketOverview';
import AlertList from '@/components/AlertList';

export default function HomePage() {
  const [marketData, setMarketData] = useState<MarketDataDoc | null>(null);
  const [alerts, setAlerts] = useState<AlertDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [market, alertsData] = await Promise.all([
          getLatestMarketData(),
          getAlerts(5),
        ]);
        setMarketData(market);
        setAlerts(alertsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement des donnees...</div>
      </div>
    );
  }

  const currentLevel = marketData?.brvm_composite || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Vue d&apos;ensemble</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MarketOverview data={marketData} />

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Alertes recentes</h3>
            <AlertList alerts={alerts} />
          </div>
        </div>

        <div className="space-y-6">
          <CorrectionGauge current={currentLevel} ath={ATH_REFERENCE} />
          <TriggerIndicators currentLevel={currentLevel} />
        </div>
      </div>
    </div>
  );
}
