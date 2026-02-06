import { db } from './firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  where,
  Timestamp,
} from 'firebase/firestore';

export interface MarketDataDoc {
  id: string;
  brvm_composite: number;
  brvm_30: number;
  brvm_prestige: number;
  variation_jour: number;
  variation_annee: number;
  volume_daily: number;
  value_daily: number;
  date: string;
  time: string;
  source: string;
  timestamp: Timestamp;
}

export interface AlertDoc {
  id: string;
  trigger_name: string;
  trigger_threshold: number;
  brvm_composite: number;
  correction_pct: number;
  expert_analysis: string;
  recommendation: string;
  action: {
    type: string;
    instrument: string;
    amount: number;
    currency: string;
    targets?: string[];
  };
  email_sent: boolean;
  status: string;
  acknowledged: boolean;
  timestamp: Timestamp;
}

export interface PortfolioDoc {
  id: string;
  instrument_type: string;
  instrument_name: string;
  ticker?: string;
  quantity: number;
  unit_price: number;
  total_invested: number;
  current_unit_price: number;
  current_total_value: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  total_income: number;
  status: string;
}

export async function getLatestMarketData(): Promise<MarketDataDoc | null> {
  const q = query(
    collection(db, 'market_data'),
    orderBy('timestamp', 'desc'),
    limit(1),
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as MarketDataDoc;
}

export async function getMarketHistory(days: number = 90): Promise<MarketDataDoc[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const q = query(
    collection(db, 'market_data'),
    where('date', '>=', startDate.toISOString().split('T')[0]),
    orderBy('date', 'asc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as MarketDataDoc));
}

export async function getAlerts(max: number = 20): Promise<AlertDoc[]> {
  const q = query(
    collection(db, 'alerts'),
    orderBy('timestamp', 'desc'),
    limit(max),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AlertDoc));
}

export async function getPortfolio(): Promise<PortfolioDoc[]> {
  const q = query(
    collection(db, 'portfolio'),
    where('status', '==', 'ACTIVE'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PortfolioDoc));
}

export async function getConfig(): Promise<any> {
  const docRef = doc(db, 'config', 'settings');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}
