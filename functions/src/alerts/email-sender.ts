import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { MarketData } from '../scrapers/brvm-web';
import { CorrectionAnalysis } from '../analysis/correction';
import { getAlertEmailHtml } from './templates';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export async function sendAlert(
  marketData: MarketData,
  analysis: CorrectionAnalysis,
): Promise<void> {
  if (!analysis.trigger_activated || !analysis.active_trigger) {
    functions.logger.info('No trigger activated, skipping alert');
    return;
  }

  const trigger = analysis.active_trigger;
  const alertEmail = process.env.ALERT_EMAIL || 'serge.bouadi@protonmail.com';
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    functions.logger.error('RESEND_API_KEY not configured');
    throw new Error('RESEND_API_KEY not configured');
  }

  // Check if alert already sent for this trigger level today
  const today = new Date().toISOString().split('T')[0];
  const existingAlert = await db.collection('alerts')
    .where('trigger_name', '==', trigger.name)
    .where('date', '==', today)
    .where('email_sent', '==', true)
    .limit(1)
    .get();

  if (!existingAlert.empty) {
    functions.logger.info(`Alert for ${trigger.name} already sent today, skipping`);
    return;
  }

  // Generate email HTML
  const emailHtml = getAlertEmailHtml(marketData, analysis);

  // Send via Resend
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);

    const emailResult = await resend.emails.send({
      from: 'BRVM Alert <alerts@brvm-monitor.com>',
      to: alertEmail,
      subject: `ALERTE CORRECTION BRVM: ${trigger.name} - ${analysis.correction_pct}%`,
      html: emailHtml,
    });

    // Store alert in Firestore
    await db.collection('alerts').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      date: today,
      trigger_name: trigger.name,
      trigger_threshold: trigger.threshold,
      brvm_composite: marketData.brvm_composite,
      ath_reference: analysis.ath_reference,
      correction_pct: analysis.correction_pct,
      action: trigger.action,
      expert_analysis: analysis.expert_analysis,
      recommendation: analysis.recommendation,
      email_sent: true,
      email_sent_at: admin.firestore.FieldValue.serverTimestamp(),
      email_id: emailResult.data?.id || null,
      status: 'SENT',
      acknowledged: false,
    });

    functions.logger.info('Alert email sent successfully', {
      trigger_name: trigger.name,
      email_id: emailResult.data?.id,
      to: alertEmail,
    });
  } catch (error: any) {
    // Store failed alert
    await db.collection('alerts').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      date: today,
      trigger_name: trigger.name,
      trigger_threshold: trigger.threshold,
      brvm_composite: marketData.brvm_composite,
      ath_reference: analysis.ath_reference,
      correction_pct: analysis.correction_pct,
      action: trigger.action,
      expert_analysis: analysis.expert_analysis,
      recommendation: analysis.recommendation,
      email_sent: false,
      status: 'FAILED',
      error_message: error.message,
      acknowledged: false,
    });

    functions.logger.error('Alert email failed', {
      trigger_name: trigger.name,
      error: error.message,
    });

    throw error;
  }
}
