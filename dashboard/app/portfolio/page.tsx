'use client';

import { useEffect, useState } from 'react';
import { getPortfolio, PortfolioDoc } from '@/lib/queries';
import { formatFCFA, formatPct } from '@/lib/utils';

export default function PortfolioPage() {
  const [positions, setPositions] = useState<PortfolioDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getPortfolio();
        setPositions(data);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalInvested = positions.reduce((sum, p) => sum + p.total_invested, 0);
  const totalValue = positions.reduce((sum, p) => sum + p.current_total_value, 0);
  const totalPnl = totalValue - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  const totalIncome = positions.reduce((sum, p) => sum + p.total_income, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Capital Investi</div>
          <div className="text-2xl font-bold">{formatFCFA(totalInvested)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Valeur Actuelle</div>
          <div className="text-2xl font-bold">{formatFCFA(totalValue)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">P&L Total</div>
          <div className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatFCFA(totalPnl)}
          </div>
          <div className={`text-sm ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPct(totalPnlPct)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Revenus Accumules</div>
          <div className="text-2xl font-bold text-blue-600">{formatFCFA(totalIncome)}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Positions Actives</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instrument</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantite</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix Achat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix Actuel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">P&L</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {positions.map((pos) => (
              <tr key={pos.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium">{pos.instrument_name}</div>
                  <div className="text-sm text-gray-500">{pos.instrument_type}</div>
                </td>
                <td className="px-6 py-4">{pos.quantity}</td>
                <td className="px-6 py-4">{formatFCFA(pos.unit_price)}</td>
                <td className="px-6 py-4">{formatFCFA(pos.current_unit_price)}</td>
                <td className="px-6 py-4">
                  <div className={pos.unrealized_pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatFCFA(pos.unrealized_pnl)}
                  </div>
                  <div className={`text-sm ${pos.unrealized_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPct(pos.unrealized_pnl_pct)}
                  </div>
                </td>
              </tr>
            ))}
            {positions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Aucune position active
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
