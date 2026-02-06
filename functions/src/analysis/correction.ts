import * as functions from 'firebase-functions';
import { ATH_REFERENCE, CORRECTION_TRIGGERS, CorrectionTrigger } from '../config/triggers';
import { MarketData } from '../scrapers/brvm-web';

export interface CorrectionAnalysis {
  current_level: number;
  ath_reference: number;
  correction_pct: number;
  trigger_activated: boolean;
  active_trigger: CorrectionTrigger | null;
  expert_analysis: string;
  recommendation: string;
}

export async function analyzeCorrection(marketData: MarketData): Promise<CorrectionAnalysis> {
  const correctionPct = ((marketData.brvm_composite - ATH_REFERENCE) / ATH_REFERENCE) * 100;

  functions.logger.info('Analyzing correction', {
    current_level: marketData.brvm_composite,
    ath: ATH_REFERENCE,
    correction_pct: correctionPct.toFixed(2),
  });

  // Find the deepest active trigger
  let activeTrigger: CorrectionTrigger | null = null;

  for (const trigger of CORRECTION_TRIGGERS) {
    if (correctionPct <= trigger.threshold) {
      activeTrigger = trigger;
    }
  }

  const expertAnalysis = generateExpertAnalysis(marketData, correctionPct, activeTrigger);
  const recommendation = generateRecommendation(correctionPct, activeTrigger);

  const analysis: CorrectionAnalysis = {
    current_level: marketData.brvm_composite,
    ath_reference: ATH_REFERENCE,
    correction_pct: +correctionPct.toFixed(2),
    trigger_activated: activeTrigger !== null,
    active_trigger: activeTrigger,
    expert_analysis: expertAnalysis,
    recommendation,
  };

  if (activeTrigger) {
    functions.logger.warn('Correction trigger activated', {
      trigger_name: activeTrigger.name,
      threshold: activeTrigger.threshold,
      brvm_level: marketData.brvm_composite,
      correction_pct: correctionPct.toFixed(2),
    });
  }

  return analysis;
}

function generateExpertAnalysis(
  marketData: MarketData,
  correctionPct: number,
  trigger: CorrectionTrigger | null,
): string {
  const sections = [
    `## Analyse Experte de la Correction\n`,
    `### Contexte Marché`,
    `Le BRVM Composite atteint **${marketData.brvm_composite.toFixed(2)}** points, soit une correction de **${correctionPct.toFixed(2)}%** depuis le sommet historique de ${ATH_REFERENCE} points du 29 janvier 2026.\n`,
    `### Variation du Jour`,
    `- Variation journalière: ${marketData.variation_jour >= 0 ? '+' : ''}${marketData.variation_jour.toFixed(2)}%`,
    `- Volume: ${marketData.volume_daily > 0 ? marketData.volume_daily.toLocaleString() + ' titres' : 'N/D'}`,
    `- Valeur échangée: ${marketData.value_daily > 0 ? (marketData.value_daily / 1_000_000).toFixed(2) + ' Mrd FCFA' : 'N/D'}\n`,
  ];

  if (trigger) {
    sections.push(
      `### Trigger Activé: ${trigger.name}`,
      `- Seuil: ${trigger.threshold}%`,
      `- Niveau cible: ${trigger.target_points.toFixed(2)} points`,
      `- Priorité: ${trigger.alert_priority}`,
      `- Action: ${trigger.action.type} ${trigger.action.instrument}`,
      `- Montant: ${trigger.action.amount.toLocaleString()} ${trigger.action.currency}`,
    );

    if (trigger.action.targets) {
      sections.push(`- Titres cibles: ${trigger.action.targets.join(', ')}`);
    }
  }

  return sections.join('\n');
}

function generateRecommendation(correctionPct: number, trigger: CorrectionTrigger | null): string {
  if (!trigger) {
    if (correctionPct > -5) {
      return 'Marché proche des sommets. Pas d\'action requise. Maintenir la surveillance.';
    }
    return `Correction de ${correctionPct.toFixed(2)}% en cours. Surveillez les niveaux de déclenchement. Prochaine tranche à -10%.`;
  }

  switch (trigger.name) {
    case 'TRANCHE_1':
      return `**ACHAT PROGRESSIF** - La correction de ${correctionPct.toFixed(2)}% ramène le marché vers des niveaux plus raisonnables. Déployer 250 000 FCFA sur TAWFIR HALAL comme prévu. Le risque d'une correction plus profonde existe mais l'allocation progressive limite ce risque.`;

    case 'TRANCHE_2':
      return `**ACHAT FORT** - La correction atteint ${correctionPct.toFixed(2)}%, un niveau historiquement attractif. Les dernières corrections de cette ampleur ont été suivies de rallyes de 20-30% sur 12-18 mois. Déployer 300 000 FCFA additionnels. Zone d'accumulation stratégique.`;

    case 'TRANCHE_3':
      return `**ACHAT AGRESSIF** - La correction de ${correctionPct.toFixed(2)}% place le marché en zone de survente extrême. Historiquement, de telles baisses génèrent des rendements de 50-100% sur 2-3 ans. Déployer 250 000 FCFA en actions directes (SNTS, BOAM, SPHC) pour maximiser le potentiel de rebond.`;

    default:
      return 'Surveiller le marché.';
  }
}
