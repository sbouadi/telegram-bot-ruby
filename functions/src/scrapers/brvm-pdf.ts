import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export async function scrapeBRVMPdf(dateStr?: string): Promise<any> {
  const date = dateStr || new Date().toISOString().split('T')[0];
  const dateFormatted = date.replace(/-/g, '');

  functions.logger.info(`Starting BRVM PDF scraping for ${date}...`);

  try {
    const fetch = (await import('node-fetch')).default;
    const pdfParse = (await import('pdf-parse')).default;

    // Try different PDF URL patterns
    const pdfUrls = [
      `https://www.brvm.org/sites/default/files/boc_${dateFormatted}_2.pdf`,
      `https://www.brvm.org/sites/default/files/boc_${dateFormatted}.pdf`,
    ];

    let pdfBuffer: Buffer | null = null;

    for (const url of pdfUrls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          pdfBuffer = Buffer.from(await response.arrayBuffer());
          functions.logger.info(`PDF found at: ${url}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!pdfBuffer) {
      throw new Error(`No PDF bulletin found for date ${date}`);
    }

    // Parse PDF content
    const pdfData = await pdfParse(pdfBuffer);
    const text = pdfData.text;

    // Extract indices using regex patterns
    const extractNumber = (pattern: RegExp): number => {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1].replace(/\s/g, '').replace(',', '.'));
      }
      return 0;
    };

    const brvm_composite = extractNumber(/BRVM\s*COMPOSITE\s*[:\s]*([\d\s,]+[\d,]+)/i);
    const brvm_30 = extractNumber(/BRVM\s*30\s*[:\s]*([\d\s,]+[\d,]+)/i);
    const variation_jour = extractNumber(/Variation\s*(?:du\s*)?Jour\s*[:\s]*([+-]?[\d\s,]+[\d,]+)\s*%/i);

    const marketData = {
      brvm_composite,
      brvm_30,
      brvm_prestige: 0,
      brvm_principal: 0,
      variation_jour,
      variation_annee: 0,
      volume_daily: 0,
      value_daily: 0,
      top_gainers: [],
      top_losers: [],
      date,
      time: '16:00',
      source: 'pdf' as const,
      scrape_duration_ms: 0,
      is_trading_day: true,
    };

    // Store in Firestore
    const docId = `${date}_1600`;
    await db.collection('market_data').doc(docId).set({
      ...marketData,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info('BRVM PDF scraping completed', {
      brvm_composite: marketData.brvm_composite,
      source: 'pdf',
      status: 'success',
    });

    return marketData;
  } catch (error: any) {
    functions.logger.error('BRVM PDF scraping failed', {
      error: error.message,
      date,
    });
    throw error;
  }
}
