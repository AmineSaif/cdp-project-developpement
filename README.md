
# GProjet – Guide de démarrage complet

## Présentation
GProjet est une application de gestion de projets Agile (Scrum) permettant de suivre les sprints, les tâches, les membres et de générer des rapports PDF détaillés. Elle se compose d’un backend Node.js/Express/PostgreSQL et d’un frontend React/Vite.

---

## Prérequis
- **Node.js** (v18+ recommandé)
- **npm** (v9+ recommandé)
- **PostgreSQL** (v14+ recommandé)
- **Git**

---

## Installation

### 1. Cloner le projet
```bash
git clone https://github.com/AmineSaif/cdp-project-developpement.git
cd cdp-project-developpement
```

### 2. Backend
```bash
cd backend
npm install
```

#### Configuration de la base de données
- Créez une base PostgreSQL (ex: `gprojet_db`).
- Copiez `.env.example` en `.env` et renseignez :
	```env
	DB_HOST=localhost
	DB_PORT=5432
	DB_USER=postgres
	DB_PASSWORD=VotreMotDePasse
	DB_NAME=gprojet_db
	JWT_SECRET=VotreSecret
	```

#### Démarrage du backend
```bash
npm run dev
```
- Accès API : `http://localhost:5000/api`

### 3. Frontend
```bash
cd ../frontend
npm install
```

#### Configuration du frontend
- Copiez `.env.example` en `.env` et adaptez l’URL de l’API :
	```env
	VITE_API_URL=http://localhost:5000/api
	```

#### Démarrage du frontend
```bash
npm run dev
```
- Accès application : `http://localhost:5173`

---

## Fonctionnalités principales
- **Gestion des projets, sprints, tâches et membres**
- **Tableaux de bord et statistiques**
- **Génération de rapports PDF (projet & sprint)**
- **Authentification JWT**
- **Charts et visualisations (Recharts)**

---

## Structure du projet
```
cdp-project-developpement/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── app.js
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── ...
│   └── ...
└── README.md
```

---

## Installation des dépendances clés

### Backend
- express
- sequelize
- pg
- dotenv
- jsonwebtoken
- cors

### Frontend
- react
- vite
- axios
- jspdf
- jspdf-autotable
- recharts

---

## Lancement rapide
1. Démarrer PostgreSQL et créer la base.
2. Configurer `.env` dans `backend` et `frontend`.
3. Installer les dépendances dans chaque dossier.
4. Lancer le backend puis le frontend.
5. Accéder à l’application via le navigateur.

---

## Génération des rapports PDF
- **Rapport projet** : bouton sur la page statistiques du projet.
- **Rapport sprint** : bouton sur la page du sprint concerné.
- Les rapports incluent toutes les informations pertinentes (métadonnées, membres, tâches, avancement, etc).

---

## Problèmes fréquents
- **Page blanche** : vérifier les exports/imports React.
- **Erreur 404 API** : vérifier la configuration de l’URL dans le frontend et le démarrage du backend.
- **Connexion DB** : vérifier les paramètres dans `.env` et que PostgreSQL est bien lancé.

---

## Contribution
- Forkez le repo, créez une branche, proposez vos modifications via Pull Request.

---

## Auteur
- Monir CHELH & Amine Saif & AMEZIANE Adnane

---

## Licence
MIT
