import * as functions from 'firebase-functions';
import { scrapeBRVM } from '../scrapers/brvm-web';
import { analyzeCorrection } from '../analysis/correction';
import { sendAlert } from '../alerts/email-sender';
import { isTradingDay } from '../config/triggers';
import { retryWithBackoff } from '../scrapers/utils';

export async function scheduledScraper(_context: functions.EventContext): Promise<void> {
  const now = new Date();

  // Check if trading day
  if (!isTradingDay(now)) {
    functions.logger.info('Not a trading day, skipping scrape', {
      date: now.toISOString(),
      day: now.toLocaleDateString('en-US', { weekday: 'long' }),
    });
    return;
  }

  // Check if within trading hours (8h-15h30 TU)
  const hours = now.getUTCHours();
  const minutes = now.getUTCMinutes();
  const tradingMinutes = hours * 60 + minutes;

  if (tradingMinutes < 480 || tradingMinutes > 930) {
    functions.logger.info('Outside trading hours, skipping scrape', {
      time: `${hours}:${minutes} TU`,
    });
    return;
  }

  functions.logger.info('Starting scheduled BRVM scrape', {
    timestamp: now.toISOString(),
  });

  try {
    // Scrape with retry
    const marketData = await retryWithBackoff(() => scrapeBRVM(), 3, 2000);

    // Analyze for corrections
    const analysis = await analyzeCorrection(marketData);

    // Send alert if trigger activated
    if (analysis.trigger_activated) {
      await sendAlert(marketData, analysis);
    }

    functions.logger.info('Scheduled scrape completed successfully', {
      brvm_composite: marketData.brvm_composite,
      correction_pct: analysis.correction_pct,
      trigger_activated: analysis.trigger_activated,
    });
  } catch (error: any) {
    functions.logger.error('Scheduled scrape failed after retries', {
      error: error.message,
      stack: error.stack,
    });
  }
}
