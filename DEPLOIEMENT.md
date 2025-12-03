# Guide de Déploiement - AMA Task Manager

## 📋 Options de déploiement

Ce projet peut être déployé de plusieurs façons :

### Option 1 : Render.com (Recommandé - Tout-en-un)
### Option 2 : Netlify (Frontend) + Render (Backend)
### Option 3 : Netlify (Frontend) + Railway (Backend)

---

## 🚀 Option 1 : Déploiement complet sur Render.com

Le fichier `render.yaml` à la racine configure automatiquement tout.

### Étapes :

1. **Connectez-vous sur [render.com](https://render.com)**
   - Créez un compte ou connectez-vous avec GitHub

2. **Créez un nouveau Blueprint**
   - Dashboard → "New" → "Blueprint"
   - Connectez votre repo GitHub : `mconr/AMAtaskManager`
   - Sélectionnez la branche `main`
   - Render détectera automatiquement `render.yaml`

3. **Configuration automatique**
   - Render créera :
     - ✅ Base de données PostgreSQL (`amataskmanager-db`)
     - ✅ Backend Web Service (`amataskmanager-backend`)
     - ✅ Frontend Static Site (`amataskmanager-frontend`)
   - Les variables d'environnement sont configurées automatiquement

4. **Initialisation de la base de données**
   - Une fois la DB créée, allez dans la section "Shell" de votre service backend
   - Exécutez :
     ```bash
     psql $DATABASE_URL -f database/create-full-schema.sql
     ```

5. **Accéder à l'application**
   - Frontend : `https://amataskmanager-frontend.onrender.com`
   - Backend API : `https://amataskmanager-backend.onrender.com/api`

### ⚠️ Important (Plan gratuit Render) :
- Les services s'endorment après 15 min d'inactivité
- Premier chargement peut prendre 30-60 secondes
- Base de données gratuite expire après 90 jours (migrer vers plan payant ou autre service)

---

## 🌐 Option 2 : Netlify (Frontend) + Render (Backend)

### A. Backend sur Render

1. **Créer un Web Service**
   - Dashboard → "New" → "Web Service"
   - Connectez `mconr/AMAtaskManager`
   - Configuration :
     ```
     Name: amataskmanager-backend
     Region: Frankfurt (ou autre)
     Branch: main
     Root Directory: backend
     Runtime: Node
     Build Command: npm install
     Start Command: npm start
     ```

2. **Créer une base PostgreSQL**
   - Dashboard → "New" → "PostgreSQL"
   - Name: `amataskmanager-db`
   - Plan: Free

3. **Variables d'environnement** (dans le Web Service)
   ```
   NODE_ENV=production
   PORT=4000
   JWT_SECRET=VotreSecretSuperSecurise123!
   DB_HOST=<depuis votre PostgreSQL>
   DB_PORT=5432
   DB_USER=<depuis votre PostgreSQL>
   DB_PASSWORD=<depuis votre PostgreSQL>
   DB_NAME=<depuis votre PostgreSQL>
   ```

4. **Initialiser la base**
   - Shell du service backend :
     ```bash
     psql $DATABASE_URL -f database/create-full-schema.sql
     ```

### B. Frontend sur Netlify

1. **Connectez-vous sur [netlify.com](https://netlify.com)**

2. **Nouveau site**
   - "Add new site" → "Import an existing project"
   - Connectez GitHub → Sélectionnez `mconr/AMAtaskManager`

3. **Configuration du build**
   - Netlify détecte automatiquement `netlify.toml`
   - Vérifiez :
     ```
     Branch: main
     Base directory: frontend
     Build command: npm install && npm run build
     Publish directory: frontend/dist
     ```

4. **Variables d'environnement**
   - Site settings → Environment variables → Add
   - Ajoutez :
     ```
     VITE_API_URL=https://amataskmanager-backend.onrender.com/api
     ```

5. **Déployez !**

6. **⚠️ CORS Important**
   - Ajoutez l'URL Netlify dans `backend/src/index.js` :
     ```javascript
     app.use(cors({
       origin: [
         'http://localhost:5173',
         'https://votre-app.netlify.app' // Remplacez par votre URL Netlify
       ],
       credentials: true
     }));
     ```
   - Committez et poussez pour mettre à jour le backend

---

## 🚂 Option 3 : Netlify (Frontend) + Railway (Backend)

### A. Backend sur Railway

1. **[railway.app](https://railway.app)** → Connectez GitHub

2. **New Project** → "Deploy from GitHub repo"
   - Sélectionnez `mconr/AMAtaskManager`

3. **Ajoutez PostgreSQL**
   - Dans le projet : "New" → "Database" → "Add PostgreSQL"

4. **Configuration du service backend**
   - Settings :
     ```
     Root Directory: backend
     Build Command: npm install
     Start Command: npm start
     ```

5. **Variables d'environnement**
   - Connectez automatiquement la DB PostgreSQL
   - Ajoutez manuellement :
     ```
     NODE_ENV=production
     PORT=4000
     JWT_SECRET=VotreSecretSecurise
     ```

6. **Initialiser la DB**
   - Railway fournit une connexion directe à PostgreSQL
   - Exécutez le script `database/create-full-schema.sql`

### B. Frontend sur Netlify
- Suivez les mêmes étapes que l'Option 2-B
- Utilisez l'URL Railway pour `VITE_API_URL`

---

## ✅ Checklist post-déploiement

### Backend
- [ ] Service backend accessible (test : `https://votre-backend.com/api`)
- [ ] Base de données créée et tables initialisées
- [ ] Variables d'environnement configurées
- [ ] CORS configuré avec l'URL du frontend
- [ ] JWT_SECRET défini et sécurisé

### Frontend
- [ ] Site accessible
- [ ] Variable `VITE_API_URL` correcte
- [ ] Connexion/Inscription fonctionne
- [ ] Pas d'erreurs CORS dans la console
- [ ] Navigation React Router fonctionne (pas de 404)

### Database
- [ ] 8 tables créées (users, projects, sprints, issues, etc.)
- [ ] Connexions depuis le backend réussies
- [ ] Données de test créées (optionnel)

---

## 🐛 Dépannage

### Erreur : "Page blanche"
- Vérifiez la console navigateur (F12)
- Vérifiez que `VITE_API_URL` est définie
- Vérifiez les redirections dans `netlify.toml`

### Erreur : "CORS policy"
- Ajoutez l'URL Netlify dans le CORS backend
- Redéployez le backend après modification

### Erreur : "Cannot connect to database"
- Vérifiez les variables d'environnement DB
- Vérifiez que la base PostgreSQL est active
- Testez la connexion depuis le shell backend

### Erreur : "404 Not Found" sur les routes
- Vérifiez que `netlify.toml` contient les redirections
- Redéployez le frontend

### Backend s'endort (Render free)
- C'est normal avec le plan gratuit
- Première requête = réveil (30-60 secondes)
- Solutions : ping régulier ou upgrade vers plan payant

---

## 📊 Monitoring

### Render.com
- Logs en temps réel dans le dashboard
- Métriques CPU/RAM
- Alertes par email

### Netlify
- Deploy logs détaillés
- Analytics (traffic, performance)
- Function logs (si utilisées)

---

## 💰 Coûts

### Plan gratuit (tout gratuit) :
- **Render** : 750h/mois (suffisant pour 1 service 24/7)
- **Netlify** : 100 GB bandwidth, builds illimités
- **PostgreSQL (Render)** : Gratuit 90 jours, puis payant ou migrer

### Upgrade recommandé si :
- Trafic > 10k visiteurs/mois
- Besoin de performances constantes
- Stockage DB > 1GB
- Temps de réveil inacceptable

---

## 🔐 Sécurité en production

### À faire absolument :
1. **Changer JWT_SECRET** → Générer un secret fort
2. **HTTPS uniquement** → Forcé par Netlify/Render
3. **Variables d'environnement sécurisées** → Jamais dans le code
4. **Rate limiting** → Ajouter dans le backend
5. **Validation des données** → Déjà en place
6. **Mots de passe forts** → Éduquer les utilisateurs
7. **Backups DB** → Configurer sur Render/Railway

---

## 📚 Ressources

- [Documentation Render](https://render.com/docs)
- [Documentation Netlify](https://docs.netlify.com)
- [Documentation Railway](https://docs.railway.app)
- [Votre RAPPORT_PROJET.md](./RAPPORT_PROJET.md)

---

**Bon déploiement ! 🚀**

Pour toute question : consultez les logs des services ou le RAPPORT_PROJET.md
