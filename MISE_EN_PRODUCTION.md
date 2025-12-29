# 🚀 GUIDE DE MISE EN PRODUCTION PAYLINK

## État actuel ✅
- Frontend Next.js : **COMPILE** ✅
- Backend NestJS : **COMPILE** ✅
- APIs Orange Money / MTN MoMo : **INTÉGRÉES** ✅
- Données MOCK : **SUPPRIMÉES** ✅

---

## 📋 ÉTAPES POUR LANCER EN PRODUCTION

### ÉTAPE 1 : Créer une base de données PostgreSQL (5 min)

**Option A : Neon.tech (RECOMMANDÉ - Gratuit)**
1. Aller sur https://neon.tech
2. Créer un compte avec Google/GitHub
3. Créer un projet "paylink"
4. Copier la connection string (ressemble à):
   ```
   postgresql://neondb_owner:XXXX@ep-xxx.eu-west-2.aws.neon.tech/neondb?sslmode=require
   ```

**Option B : Railway (Payant mais simple)**
1. Aller sur https://railway.app
2. Créer un nouveau projet
3. Ajouter une base PostgreSQL
4. Copier la DATABASE_URL

---

### ÉTAPE 2 : Configurer le backend (5 min)

Modifier le fichier `backend/.env` :

```bash
# Remplacer par ta vraie URL Neon.tech
DATABASE_URL="postgresql://neondb_owner:XXXX@ep-xxx.eu-west-2.aws.neon.tech/neondb?sslmode=require"

# Générer des secrets aléatoires (obligatoire en production)
JWT_SECRET="GENERER_AVEC_openssl_rand_base64_32"
JWT_REFRESH_SECRET="GENERER_AVEC_openssl_rand_base64_32"

# URLs
FRONTEND_URL="https://paylink-one.vercel.app"
PORT=4000
NODE_ENV="production"

# Email (optionnel pour commencer)
RESEND_API_KEY="re_xxxxxxxxxxxxx"
EMAIL_FROM="PayLink <paylink.now@gmail.com>"
```

---

### ÉTAPE 3 : Tester en local (10 min)

```bash
# Terminal 1 : Backend
cd backend
npm install
npx prisma generate
npx prisma db push  # Crée les tables dans la base
npm run start:dev

# Terminal 2 : Frontend
cd frontend
npm install
npm run dev
```

Ouvrir http://localhost:3000 et tester :
1. Créer un compte
2. Se connecter
3. Créer une page
4. Vérifier que la page apparaît dans "Mes pages"

---

### ÉTAPE 4 : Déployer le backend sur Railway (10 min)

**Pourquoi Railway et pas Render ?**
Railway gère mieux les monorepos et a moins de problèmes de configuration.

1. Aller sur https://railway.app
2. Créer un nouveau projet
3. Connecter le repo GitHub `fokobelmond/paylink`
4. **IMPORTANT** : Dans les settings du service :
   - Root Directory : `backend`
   - Build Command : `npm install && npx prisma generate && npx nest build`
   - Start Command : `npm run start:prod`

5. Ajouter les variables d'environnement :
   - `DATABASE_URL` = ta connection string Neon
   - `JWT_SECRET` = généré aléatoirement
   - `JWT_REFRESH_SECRET` = généré aléatoirement
   - `FRONTEND_URL` = https://paylink-one.vercel.app
   - `NODE_ENV` = production
   - `PORT` = 4000

6. Noter l'URL du backend (ex: https://paylink-backend.railway.app)

---

### ÉTAPE 5 : Configurer Vercel (5 min)

1. Aller sur https://vercel.com/dashboard
2. Aller dans le projet paylink
3. Settings > Environment Variables
4. Ajouter/Modifier :
   - `NEXT_PUBLIC_API_URL` = https://paylink-backend.railway.app (URL de Railway)

5. Redéployer le frontend

---

### ÉTAPE 6 : Configurer Orange Money (30 min)

**Pour recevoir de vrais paiements, tu dois :**

1. **Créer un compte marchand Orange Money**
   - Aller sur https://developer.orange.com
   - Créer un compte
   - Souscrire à l'API "Orange Money Webpay" pour le Cameroun

2. **Demander l'accès production**
   - Remplir le formulaire de demande
   - Fournir les documents légaux de ton entreprise
   - Attendre la validation (peut prendre 1-2 semaines)

3. **Récupérer les credentials**
   - Merchant Key
   - API User
   - API Key
   - Webhook Secret

4. **Configurer dans Railway**
   Ajouter les variables :
   - `ORANGE_MONEY_MERCHANT_KEY`
   - `ORANGE_MONEY_API_USER`
   - `ORANGE_MONEY_API_KEY`
   - `ORANGE_MONEY_WEBHOOK_SECRET`
   - `ORANGE_MONEY_ENV` = production

---

## 🔧 COMMANDES UTILES

```bash
# Générer des secrets JWT sécurisés
openssl rand -base64 32

# Voir les logs du backend local
cd backend && npm run start:dev

# Réinitialiser la base de données
cd backend && npx prisma db push --force-reset

# Voir les données en base
cd backend && npx prisma studio
```

---

## 💰 STRUCTURE DES FRAIS

Actuellement configuré dans `backend/prisma/schema.prisma` :
- Frais plateforme PayLink : 2% par défaut
- Les frais Orange/MTN sont ajoutés automatiquement

Pour modifier, aller dans `PaymentFee` dans la base de données.

---

## 🔒 CHECKLIST SÉCURITÉ PRODUCTION

- [ ] JWT_SECRET différent du développement
- [ ] JWT_REFRESH_SECRET différent du développement
- [ ] CORS configuré uniquement pour ton domaine
- [ ] HTTPS obligatoire
- [ ] Rate limiting activé (déjà fait)
- [ ] Validation des entrées (déjà fait avec class-validator)

---

## 📱 POUR L'APP STORE (Plus tard)

Si tu veux publier sur l'App Store :
1. Utiliser Capacitor ou React Native Web pour wrapper le site
2. La suppression de compte est déjà implémentée (requis par Apple)
3. Ajouter les politiques de confidentialité (déjà fait)

---

## ⚠️ IMPORTANT

**Tu ne pourras pas recevoir de vrais paiements tant que :**
1. Tu n'as pas de compte marchand Orange Money validé
2. Tu n'as pas de certificat d'entreprise

**En attendant**, le système fonctionne en mode simulation :
- Les transactions sont créées en base
- Mais aucun argent n'est débité/crédité
- Parfait pour tester le flux complet

---

## 📞 SUPPORT

Email : paylink.now@gmail.com

---

**Bonne chance ! 🚀**

