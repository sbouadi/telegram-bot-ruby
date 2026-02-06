# BRVM-correction

Systeme de monitoring automatise de la BRVM (Bourse Regionale des Valeurs Mobilieres) avec alertes intelligentes pour optimiser les points d'entree d'investissement.

## Architecture

- **Backend**: Firebase Cloud Functions (TypeScript) - Scraping, analyse, alertes
- **Frontend**: Next.js 14 + Tailwind CSS - Dashboard de visualisation
- **Database**: Firestore - Historisation donnees marche
- **Emails**: Resend API - Alertes correction

## Fonctionnalites

- Scraping automatise BRVM (PDF bulletins + interface web temps reel)
- Detection corrections depuis ATH (362.09 pts, 29 Jan 2026)
- 3 niveaux de trigger: -10%, -15%, -25%
- Alertes email avec analyse experte
- Dashboard temps reel (indices, corrections, portfolio, alertes)
- Suivi portefeuille avec P&L

## Structure

```
brvm-correction/
├── functions/          # Firebase Cloud Functions
│   └── src/
│       ├── scrapers/   # Scraping BRVM (PDF + Web)
│       ├── analysis/   # Analyse corrections
│       ├── alerts/     # Emails Resend
│       ├── cron/       # Scheduled scraper
│       └── config/     # Triggers & config
├── dashboard/          # Next.js 14 Frontend
│   ├── app/            # Pages (accueil, marche, portfolio, alertes, config)
│   ├── components/     # UI components
│   └── lib/            # Firebase, queries, utils
├── firestore.rules     # Regles securite Firestore
└── firebase.json       # Config Firebase
```

## Deploiement

```bash
# Install
cd functions && npm install
cd ../dashboard && npm install

# Dev local
npm run dev:functions
npm run dev:dashboard

# Deploy
firebase deploy
```

## Configuration

Voir `BRVM_MONITOR_TECHNICAL_SPECS.md` pour les specifications techniques completes.
