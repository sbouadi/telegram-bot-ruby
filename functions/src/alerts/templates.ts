import { MarketData } from '../scrapers/brvm-web';
import { CorrectionAnalysis } from '../analysis/correction';

export function getAlertEmailHtml(
  marketData: MarketData,
  analysis: CorrectionAnalysis,
): string {
  const trigger = analysis.active_trigger!;
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', {
    timeZone: 'Africa/Abidjan',
    dateStyle: 'full',
  });
  const timeStr = now.toLocaleTimeString('fr-FR', {
    timeZone: 'Africa/Abidjan',
    timeStyle: 'short',
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .alert-level { font-size: 24px; font-weight: bold; margin: 10px 0; }
    .metrics { background: #f7fafc; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .metric-row { display: flex; justify-content: space-between; margin: 8px 0; }
    .metric-label { font-weight: 600; color: #4a5568; }
    .metric-value { color: #2d3748; font-weight: bold; }
    .correction-negative { color: #e53e3e; }
    .action-box { background: #edf2f7; border-left: 4px solid #4299e1; padding: 15px; margin: 15px 0; }
    .expert-analysis { background: white; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 15px 0; }
    .recommendation { background: #c6f6d5; border-left: 4px solid #48bb78; padding: 15px; margin: 15px 0; font-weight: 600; }
    .footer { text-align: center; color: #718096; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ALERTE CORRECTION BRVM</h1>
      <div class="alert-level">${trigger.name} ACTIVE</div>
      <p>Detecte le ${dateStr} a ${timeStr}</p>
    </div>

    <div class="metrics">
      <h3>Metriques Marche</h3>
      <div class="metric-row">
        <span class="metric-label">BRVM Composite:</span>
        <span class="metric-value">${marketData.brvm_composite.toFixed(2)} points</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Correction depuis ATH:</span>
        <span class="metric-value correction-negative">${analysis.correction_pct}%</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">ATH Reference:</span>
        <span class="metric-value">${analysis.ath_reference} points (29 Jan 2026)</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Variation jour:</span>
        <span class="metric-value">${marketData.variation_jour >= 0 ? '+' : ''}${marketData.variation_jour.toFixed(2)}%</span>
      </div>
    </div>

    <div class="action-box">
      <h3>ACTION REQUISE</h3>
      <p><strong>Instrument:</strong> ${trigger.action.instrument}</p>
      <p><strong>Montant a deployer:</strong> ${trigger.action.amount.toLocaleString()} ${trigger.action.currency}</p>
      <p><strong>Type operation:</strong> ${trigger.action.type}</p>
      ${trigger.action.targets ? `<p><strong>Titres cibles:</strong> ${trigger.action.targets.join(', ')}</p>` : ''}
    </div>

    <div class="expert-analysis">
      <h3>Analyse Experte</h3>
      <pre style="white-space: pre-wrap; font-family: inherit;">${analysis.expert_analysis}</pre>
    </div>

    <div class="recommendation">
      <h3>Recommandation</h3>
      <p>${analysis.recommendation}</p>
    </div>

    <div class="footer">
      <p>BRVM Monitor - Systeme automatise de surveillance de marche</p>
      <p>Version 1.0.0</p>
    </div>
  </div>
</body>
</html>`;
}
