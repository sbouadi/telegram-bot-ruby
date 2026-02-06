import * as functions from 'firebase-functions';
import { scheduledScraper } from './cron/scheduled-scraper';
import { scrapeBRVM } from './scrapers/brvm-web';
import { analyzeCorrection } from './analysis/correction';
import { sendAlert } from './alerts/email-sender';

// Scheduled scraper - runs every 30 min during trading hours (8h-15h30 TU, Mon-Fri)
export const scheduledBRVMScraper = functions
  .region('europe-west3')
  .pubsub.schedule('*/30 8-15 * * 1-5')
  .timeZone('UTC')
  .onRun(scheduledScraper);

// Manual scrape trigger (HTTP)
export const manualScrape = functions
  .region('europe-west3')
  .https.onRequest(async (req, res) => {
    try {
      const data = await scrapeBRVM();
      const analysis = await analyzeCorrection(data);

      if (analysis.trigger_activated) {
        await sendAlert(data, analysis);
      }

      res.json({ success: true, data, analysis });
    } catch (error: any) {
      functions.logger.error('Manual scrape failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  });

// Test trigger endpoint (HTTP)
export const testTrigger = functions
  .region('europe-west3')
  .https.onRequest(async (req, res) => {
    try {
      const { brvm_level } = req.body;

      if (!brvm_level) {
        res.status(400).json({ error: 'brvm_level required' });
        return;
      }

      const mockData = {
        brvm_composite: brvm_level,
        brvm_30: 0,
        brvm_prestige: 0,
        brvm_principal: 0,
        variation_jour: 0,
        variation_annee: 0,
        volume_daily: 0,
        value_daily: 0,
        top_gainers: [],
        top_losers: [],
        date: new Date().toISOString().split('T')[0],
        time: new Date().toISOString().split('T')[1].substring(0, 5),
        source: 'test' as const,
        scrape_duration_ms: 0,
        is_trading_day: true,
      };

      const analysis = await analyzeCorrection(mockData);

      if (analysis.trigger_activated) {
        await sendAlert(mockData, analysis);
      }

      res.json({ success: true, analysis });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

// Health check
export const health = functions
  .region('europe-west3')
  .https.onRequest((_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });
