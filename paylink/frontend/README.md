# PayLink Frontend

Application Next.js 14 pour la plateforme PayLink.

## 🚀 Démarrage rapide

```bash
# Installation
npm install

# Configuration
cp .env.local.example .env.local
# Éditer avec l'URL de l'API

# Développement
npm run dev

# Production
npm run build
npm run start
```

## 📁 Structure

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── (auth)/            # Pages auth (login, register)
│   ├── (dashboard)/       # Dashboard protégé
│   ├── p/[slug]/          # Pages publiques
│   └── pay/               # Page de paiement
├── components/
│   ├── templates/         # 6 templates de pages
│   └── ui/                # Composants réutilisables
├── lib/                   # Utilitaires + API client
├── store/                 # État global (Zustand)
└── types/                 # Types TypeScript
```

## 🎨 Templates

1. **ServiceProviderTemplate** - Prestataires
2. **SimpleSaleTemplate** - Vente simple
3. **DonationTemplate** - Dons/ONG
4. **TrainingTemplate** - Formations
5. **EventTemplate** - Événements
6. **AssociationTemplate** - Associations

## 🔧 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Développement |
| `npm run build` | Build production |
| `npm run start` | Serveur production |
| `npm run lint` | ESLint |
| `npm run type-check` | Vérification TypeScript |

## 🎯 Pages de démo

- `/p/marie-coiffure`
- `/p/ong-espoir`
- `/p/formation-excel`
- `/p/concert-makossa`
- `/p/club-entrepreneurs`
- `/p/vente-telephone`

