import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export interface MarketData {
  brvm_composite: number;
  brvm_30: number;
  brvm_prestige: number;
  brvm_principal: number;
  variation_jour: number;
  variation_annee: number;
  volume_daily: number;
  value_daily: number;
  top_gainers: Array<{ ticker: string; name: string; price: number; change_pct: number }>;
  top_losers: Array<{ ticker: string; name: string; price: number; change_pct: number }>;
  sector_indices?: {
    agriculture: number;
    industry: number;
    services: number;
    finance: number;
  };
  date: string;
  time: string;
  source: 'pdf' | 'web' | 'test';
  scrape_duration_ms: number;
  is_trading_day: boolean;
}

export async function scrapeBRVM(): Promise<MarketData> {
  const startTime = Date.now();

  functions.logger.info('Starting BRVM web scraping...');

  let browser;
  try {
    const puppeteer = await import('puppeteer-core');
    browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // In Cloud Functions, use the bundled Chrome; locally, set CHROME_PATH env var
      executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome-stable',
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    // Navigate to BRVM live data page
    await page.goto('https://www.brvm.org/fr/cours-actions/0', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Extract market data from the page
    const data = await page.evaluate(() => {
      const getText = (selector: string): string => {
        const el = document.querySelector(selector);
        return el ? el.textContent?.trim() || '0' : '0';
      };

      const parseNumber = (text: string): number => {
        return parseFloat(text.replace(/\s/g, '').replace(',', '.')) || 0;
      };

      // Extract indices from the page
      // Note: selectors may need adjustment based on actual BRVM page structure
      const compositeText = getText('.brvm-composite-value') || getText('[data-index="composite"]');
      const variationText = getText('.brvm-composite-variation') || getText('[data-variation="composite"]');

      return {
        composite: parseNumber(compositeText),
        variation: parseNumber(variationText),
      };
    });

    const now = new Date();
    const marketData: MarketData = {
      brvm_composite: data.composite,
      brvm_30: 0,
      brvm_prestige: 0,
      brvm_principal: 0,
      variation_jour: data.variation,
      variation_annee: 0,
      volume_daily: 0,
      value_daily: 0,
      top_gainers: [],
      top_losers: [],
      date: now.toISOString().split('T')[0],
      time: now.toISOString().split('T')[1].substring(0, 5),
      source: 'web',
      scrape_duration_ms: Date.now() - startTime,
      is_trading_day: true,
    };

    // Store in Firestore
    const docId = `${marketData.date}_${marketData.time.replace(':', '')}`;
    await db.collection('market_data').doc(docId).set({
      ...marketData,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info('BRVM scraping completed', {
      brvm_composite: marketData.brvm_composite,
      duration_ms: marketData.scrape_duration_ms,
      status: 'success',
    });

    return marketData;
  } catch (error: any) {
    functions.logger.error('BRVM scraping failed', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
