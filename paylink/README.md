# PayLink 💳

<p align="center">
  <img src="docs/logo.png" alt="PayLink Logo" width="120" />
</p>

<p align="center">
  <strong>Plateforme SaaS de paiement Mobile Money pour le Cameroun</strong>
</p>

<p align="center">
  <a href="#fonctionnalités">Fonctionnalités</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#installation">Installation</a> •
  <a href="#déploiement">Déploiement</a> •
  <a href="#api">API</a>
</p>

---

## 🎯 Objectif

**PayLink** permet à n'importe qui (freelance, vendeur, ONG, école, association) de créer une page publique unique pour recevoir des paiements via **Orange Money** et **MTN MoMo**.

> "Permettre à quelqu'un de se faire payer facilement, rapidement et de manière fiable."

---

## ✨ Fonctionnalités

### Pour les utilisateurs
- ✅ Création de compte en 30 secondes
- ✅ 6 templates adaptés à chaque usage
- ✅ Personnalisation couleur et logo
- ✅ Lien unique partageable (WhatsApp, Facebook, etc.)
- ✅ Dashboard avec statistiques en temps réel
- ✅ Historique complet des transactions
- ✅ Notifications SMS et email

### Pour les payeurs
- ✅ Paiement en quelques clics
- ✅ Orange Money & MTN MoMo
- ✅ Confirmation instantanée par SMS
- ✅ Reçu avec référence unique

### Technique
- ✅ Idempotence des paiements (protection double-clic)
- ✅ Webhooks sécurisés (signature HMAC)
- ✅ Traçabilité complète (logs)
- ✅ Rate limiting
- ✅ Mobile-first & responsive
- ✅ Tolérance aux erreurs réseau

---

## 🎨 Templates disponibles

| Template | Usage | Description |
|----------|-------|-------------|
| 🔧 **Prestataire** | Freelances, coachs | Liste de services avec prix fixes |
| 🛍️ **Vente simple** | Vendeurs WhatsApp | Produit unique avec achat direct |
| ❤️ **Don / ONG** | Associations | Montant libre avec barre de progression |
| 📚 **Formation** | Formateurs, écoles | Inscription avec date et durée |
| 🎉 **Événement** | Concerts, conférences | Billets avec places limitées |
| 🤝 **Association** | Clubs | Cotisations membres |

---

## 🏗️ Architecture

```
paylink/
├── backend/                 # API NestJS + TypeScript
│   ├── prisma/             # Schéma PostgreSQL
│   └── src/
│       ├── auth/           # JWT + Refresh tokens
│       ├── pages/          # CRUD pages
│       ├── services/       # CRUD services/produits
│       ├── payments/       # Initiation + Webhooks
│       ├── transactions/   # Historique
│       ├── dashboard/      # Statistiques
│       └── notifications/  # SMS + Email
│
├── frontend/               # Next.js 14 + TypeScript
│   └── src/
│       ├── app/           # App Router
│       │   ├── (auth)/    # Login, Register
│       │   ├── (dashboard)/ # Zone protégée
│       │   ├── p/[slug]/  # Pages publiques
│       │   └── pay/       # Paiement
│       ├── components/
│       │   ├── templates/ # 6 templates
│       │   └── ui/        # Boutons, Inputs...
│       ├── lib/           # API client, utils
│       └── store/         # Zustand (état global)
│
└── docker-compose.yml      # PostgreSQL + Redis
```

### Stack technique

| Composant | Technologie |
|-----------|-------------|
| **Frontend** | Next.js 14, React 18, TypeScript, TailwindCSS |
| **Backend** | NestJS 10, TypeScript, Prisma ORM |
| **Base de données** | PostgreSQL 15 |
| **Cache** | Redis 7 |
| **Auth** | JWT + Refresh Tokens |
| **Paiements** | Orange Money API, MTN MoMo API |
| **SMS** | Provider SMS camerounais |
| **Email** | Resend |
| **Infra** | Docker, Docker Compose |

---

## 📊 Modèle de données

```
┌─────────────────┐       ┌─────────────────┐
│      User       │       │   Subscription  │
├─────────────────┤       ├─────────────────┤
│ id              │───────│ userId          │
│ email           │       │ plan            │
│ phone           │       │ maxPages        │
│ firstName       │       │ transactionFee  │
│ lastName        │       └─────────────────┘
│ passwordHash    │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐       ┌─────────────────┐
│      Page       │       │     Service     │
├─────────────────┤       ├─────────────────┤
│ id              │───────│ pageId          │
│ slug (unique)   │       │ name            │
│ templateType    │       │ description     │
│ title           │       │ price           │
│ description     │       │ isActive        │
│ primaryColor    │       │ sortOrder       │
│ templateData    │       └─────────────────┘
│ status          │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐       ┌─────────────────┐
│   Transaction   │       │ TransactionLog  │
├─────────────────┤       ├─────────────────┤
│ id              │───────│ transactionId   │
│ reference       │       │ event           │
│ amount          │       │ message         │
│ payerPhone      │       │ metadata        │
│ payerName       │       │ createdAt       │
│ provider        │       └─────────────────┘
│ status          │
│ idempotencyKey  │
└─────────────────┘
```

---

## 🚀 Installation

### Prérequis

- Node.js 20+
- PostgreSQL 15+
- Redis 7+ (optionnel)
- Docker & Docker Compose (recommandé)

### 1. Cloner le projet

```bash
git clone https://github.com/votre-repo/paylink.git
cd paylink
```

### 2. Démarrer les services avec Docker

```bash
docker-compose up -d postgres redis
```

### 3. Configurer le backend

```bash
cd backend

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env

# Éditer .env avec vos valeurs :
# - DATABASE_URL
# - JWT_SECRET
# - JWT_REFRESH_SECRET
# - Clés API paiement (optionnel en dev)

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev

# Démarrer le serveur
npm run start:dev
```

### 4. Configurer le frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.local.example .env.local

# Démarrer le serveur de développement
npm run dev
```

### 5. Accéder à l'application

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Frontend |
| http://localhost:4000 | API Backend |
| http://localhost:4000/docs | Documentation Swagger |

### Pages de démo

- `/p/marie-coiffure` - Template Prestataire
- `/p/ong-espoir` - Template Don/ONG
- `/p/formation-excel` - Template Formation
- `/p/concert-makossa` - Template Événement
- `/p/club-entrepreneurs` - Template Association
- `/p/vente-telephone` - Template Vente simple

---

## 💳 Flow de paiement

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  1. Client   │     │  2. PayLink  │     │  3. Provider │
│   (Payeur)   │     │    (API)     │     │ (OM / MTN)   │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │  Sélectionne       │                    │
       │  service + Payer   │                    │
       │───────────────────>│                    │
       │                    │                    │
       │                    │  Crée transaction  │
       │                    │  (PENDING)         │
       │                    │                    │
       │                    │  Appel API         │
       │                    │───────────────────>│
       │                    │                    │
       │   Notification     │                    │
       │   "Validez sur     │                    │
       │    téléphone"      │                    │
       │<───────────────────│                    │
       │                    │                    │
       │                    │     Webhook        │
       │                    │<───────────────────│
       │                    │                    │
       │                    │  Vérifie signature │
       │                    │  Met à jour status │
       │                    │  (SUCCESS/FAILED)  │
       │                    │                    │
       │   SMS confirmation │                    │
       │<───────────────────│                    │
       │                    │                    │
       │                    │   SMS au vendeur   │
       │                    │───────────────────>│
       │                    │                    │
```

### Points de sécurité critiques

1. **Idempotence** - Clé unique par transaction pour éviter les doublons
2. **Signature webhook** - Vérification HMAC-SHA256
3. **Rate limiting** - Protection contre les abus
4. **Validation serveur** - Aucune confiance au client
5. **Logs complets** - Traçabilité de chaque événement

---

## 🔌 API Reference

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/logout` | Déconnexion |
| POST | `/api/auth/refresh` | Rafraîchir token |
| GET | `/api/auth/me` | Utilisateur courant |

### Pages

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/pages` | Lister mes pages |
| POST | `/api/pages` | Créer une page |
| GET | `/api/pages/:id` | Détails d'une page |
| PATCH | `/api/pages/:id` | Modifier une page |
| DELETE | `/api/pages/:id` | Supprimer une page |
| POST | `/api/pages/:id/publish` | Publier |
| GET | `/api/pages/slug/:slug` | Page publique (par slug) |

### Paiements

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/payments/initiate` | Initier un paiement |
| GET | `/api/payments/status/:ref` | Vérifier statut |
| POST | `/api/payments/webhook/orange-money` | Webhook Orange |
| POST | `/api/payments/webhook/mtn-momo` | Webhook MTN |

### Transactions

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/transactions` | Historique |
| GET | `/api/transactions/:id` | Détails |
| GET | `/api/transactions/stats` | Statistiques |
| GET | `/api/transactions/export` | Export CSV |

---

## 🐳 Déploiement

### Docker Compose (Production)

```bash
# Build et démarrer tous les services
docker-compose -f docker-compose.yml up -d --build

# Voir les logs
docker-compose logs -f
```

### Variables d'environnement (Production)

```env
# Base de données
DATABASE_URL=postgresql://user:password@host:5432/paylink

# JWT (utiliser des secrets forts!)
JWT_SECRET=votre-secret-tres-long-et-securise-min-64-chars
JWT_REFRESH_SECRET=autre-secret-tres-long-et-securise

# Paiements
ORANGE_MONEY_API_KEY=xxx
ORANGE_MONEY_WEBHOOK_SECRET=xxx
MTN_MOMO_API_KEY=xxx
MTN_MOMO_WEBHOOK_SECRET=xxx

# Notifications
SMS_API_KEY=xxx
RESEND_API_KEY=xxx
```

---

## 💰 Modèle économique

| Plan | Prix | Pages | Commission |
|------|------|-------|------------|
| **Gratuit** | 0 FCFA/mois | 1 | 3% |
| **Starter** | 5 000 FCFA/mois | 3 | 2% |
| **Pro** | 15 000 FCFA/mois | Illimité | 1.5% |
| **Enterprise** | Sur devis | Illimité | Négociable |

---

## 🔒 Sécurité

- ✅ HTTPS obligatoire en production
- ✅ Mots de passe hashés (bcrypt, 12 rounds)
- ✅ JWT avec expiration courte (15min)
- ✅ Refresh tokens (7 jours)
- ✅ Rate limiting par IP
- ✅ Validation stricte des entrées
- ✅ Protection CSRF
- ✅ Headers de sécurité (Helmet)
- ✅ Webhooks signés et vérifiés

---

## 📱 Captures d'écran

<p align="center">
  <img src="docs/screenshots/landing.png" alt="Landing Page" width="250" />
  <img src="docs/screenshots/dashboard.png" alt="Dashboard" width="250" />
  <img src="docs/screenshots/payment.png" alt="Payment" width="250" />
</p>

---

## 🛣️ Roadmap

### Version 1.0 (MVP)
- [x] Authentification complète
- [x] 6 templates de pages
- [x] Flow de paiement Orange Money / MTN
- [x] Dashboard et statistiques
- [x] Notifications SMS/Email

### Version 1.1
- [ ] Intégration API Orange Money réelle
- [ ] Intégration API MTN MoMo réelle
- [ ] QR Code pour les pages
- [ ] Rappels automatiques (paiements en attente)

### Version 1.2
- [ ] Multi-devises (XAF, EUR)
- [ ] Support France (diaspora)
- [ ] Application mobile (React Native)
- [ ] Webhooks personnalisés pour intégrations

### Version 2.0
- [ ] Marketplace de templates
- [ ] API publique pour développeurs
- [ ] Paiements récurrents (abonnements)
- [ ] Multi-utilisateurs par compte

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines.

```bash
# Fork le projet
# Crée ta branche
git checkout -b feature/ma-fonctionnalite

# Commit tes changements
git commit -m "feat: ajoute ma fonctionnalité"

# Push
git push origin feature/ma-fonctionnalite

# Ouvre une Pull Request
```

---

## 📄 Licence

Propriétaire - Tous droits réservés.

---

## 📞 Support

- 📧 Email: support@paylink.cm
- 💬 WhatsApp: +237 6XX XXX XXX
- 🌐 Site: https://paylink.cm

---

<p align="center">
  Made with ❤️ in Cameroon 🇨🇲
</p>
