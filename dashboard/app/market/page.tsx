'use client';

import { useEffect, useState } from 'react';
import { getMarketHistory, MarketDataDoc } from '@/lib/queries';
import { formatPct } from '@/lib/utils';

export default function MarketPage() {
  const [history, setHistory] = useState<MarketDataDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getMarketHistory(90);
        setHistory(data);
      } catch (error) {
        console.error('Error fetching market history:', error);
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
      <h1 className="text-2xl font-bold text-gray-900">Donnees Marche</h1>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BRVM Composite</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variation Jour</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {history.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{row.date}</td>
                <td className="px-6 py-4 font-medium">{row.brvm_composite.toFixed(2)}</td>
                <td className={`px-6 py-4 ${row.variation_jour >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPct(row.variation_jour)}
                </td>
                <td className="px-6 py-4">{row.volume_daily > 0 ? row.volume_daily.toLocaleString() : '-'}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs uppercase">{row.source}</span>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Aucune donnee disponible
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
