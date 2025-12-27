# PayLink Backend API

API REST NestJS pour la plateforme PayLink.

## 🚀 Démarrage rapide

```bash
# Installation
npm install

# Configuration
cp .env.example .env
# Éditer .env avec vos valeurs

# Base de données
npx prisma generate
npx prisma migrate dev

# Développement
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📁 Structure

```
src/
├── auth/           # Authentification JWT
├── users/          # Gestion utilisateurs
├── pages/          # CRUD pages de paiement
├── services/       # CRUD services/produits
├── payments/       # Flow de paiement + webhooks
├── transactions/   # Historique transactions
├── dashboard/      # Statistiques
├── notifications/  # SMS + Email
└── prisma/         # Service Prisma
```

## 🔧 Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Développement (watch mode) |
| `npm run start:prod` | Production |
| `npm run build` | Build |
| `npm run lint` | ESLint |
| `npm run test` | Tests unitaires |
| `npm run prisma:studio` | Interface Prisma |
| `npm run prisma:migrate` | Migrations |

## 📚 Documentation API

Swagger disponible sur `/docs` en développement.

## 🔐 Variables d'environnement

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
ORANGE_MONEY_API_KEY=...
MTN_MOMO_API_KEY=...
RESEND_API_KEY=...
```

