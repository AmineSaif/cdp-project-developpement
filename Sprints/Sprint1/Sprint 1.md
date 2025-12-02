# Sprint 1 - MVP Fonctionnel + Board Kanban

**Période :** 13 Novembre - 19 Novembre 2025  
**Équipe :**  Chelh Monir, Ameziane Adnane, Saif Amine  
**Statut :** ✅ TERMINÉ

---

## Contexte du Sprint

Suite à la phase préparatoire du Sprint 0, le Sprint 1 (Sprint 1/2) représente le premier sprint de développement effectif. L'objectif principal était de livrer un MVP (Minimum Viable Product) fonctionnel avec les fonctionnalités essentielles de gestion de projet, incluant un Board Kanban innovant.

---

## Objectifs du Sprint 2

### Objectifs Principaux

1. **Authentification complète** : Inscription, connexion, déconnexion, profil utilisateur
2. **Gestion des Issues** : CRUD complet avec types (Task, Bug, Feature)
3. **Board Kanban** : Visualisation et gestion des issues avec drag & drop
4. **Profil utilisateur** : Page de profil avec statistiques personnelles
5. **Infrastructure technique** : Backend API REST + Frontend React + PostgreSQL

### Livrables Attendus

- Application web fonctionnelle accessible
- Authentification sécurisée avec JWT
- Board Kanban avec 4 colonnes
- Base de données PostgreSQL opérationnelle
- Documentation technique

---

## Organisation du Sprint

### Répartition de l'Équipe

| Membre | Rôle | Responsabilités Principales |
|--------|------|----------------------------|
| **Chelh Monir** | Backend Lead + Scrum Master | Architecture backend, API REST, Base de données, Authentification, Intégration frontend/backend |
| **Ameziane Adnane** | Frontend Lead | Interface utilisateur, Board Kanban (frontend), Composants React |
| **Saif Amine** | Full-Stack | Gestion des issues, Tests |

### Durée et Charge de Travail

- **Durée totale** : 1 semaine 
- **Points réalisés** : 48 points
- **Taux de complétion** : 100%

---

## Fonctionnalité 1 : Authentification

### US-001 : Création de compte (3 points)

**Description :**  
En tant qu'utilisateur, je veux créer un compte pour accéder à l'application.

**Implémentation :**
- Formulaire d'inscription avec validation
- Champs : Nom, Email, Mot de passe, Code d'équipe (optionnel)
- Validation côté client et serveur
- Hash du mot de passe avec bcrypt
- Génération automatique d'un ID unique
- Message de confirmation après création

**Critères d'acceptation :**
- ✅ Validation de l'email (format valide)
- ✅ Mot de passe fort (8+ caractères, majuscule, chiffre)
- ✅ Hash bcrypt avant stockage
- ✅ Message de confirmation affiché
- ✅ Redirection automatique vers login

**Statut :** ✅ TERMINÉ

---

### US-002 : Connexion utilisateur (3 points)

**Description :**  
En tant qu'utilisateur, je veux me connecter pour accéder à mon espace de travail.

**Implémentation :**
- Formulaire de connexion (Email + Mot de passe)
- Vérification des credentials dans PostgreSQL
- Génération d'un token JWT (expire en 24h)
- Stockage sécurisé du token (localStorage)
- Redirection vers le Board après connexion
- Gestion des erreurs (identifiants incorrects)

**Critères d'acceptation :**
- ✅ Vérification email/mot de passe
- ✅ Token JWT généré
- ✅ Redirection vers /board
- ✅ Message d'erreur si échec
- ✅ Session persistante

**Statut :** ✅ TERMINÉ

---

### US-003 : Déconnexion (1 point)

**Description :**  
En tant qu'utilisateur, je veux me déconnecter pour sécuriser mon compte.

**Implémentation :**
- Bouton "Se déconnecter" visible dans le header
- Suppression du token JWT
- Clear du localStorage
- Redirection vers la page de login

**Critères d'acceptation :**
- ✅ Bouton visible dans l'interface
- ✅ Token supprimé
- ✅ Redirection vers /login
- ✅ Session terminée

**Statut :** ✅ TERMINÉ

---

### US-004 : Page de profil (2 points)

**Description :**  
En tant qu'utilisateur, je veux voir mon profil pour consulter mes informations.

**Implémentation :**
- Page "Mon Profil" accessible depuis le header
- 3 onglets : Informations personnelles, Statistiques, Mot de passe
- Affichage : Nom, Email, Rôle, Code d'équipe
- Statistiques : Nombre d'issues créées, terminées, en cours, en révision
- Possibilité de copier le code d'équipe
- Bouton de sauvegarde des modifications

**Critères d'acceptation :**
- ✅ Page profil accessible
- ✅ Affichage des informations
- ✅ Statistiques calculées en temps réel
- ✅ Code d'équipe copiable
- ✅ Modifications sauvegardables

**Statut :** ✅ TERMINÉ

**Total Authentification : 9 points**

---

## 📋 Fonctionnalité 2 : Gestion des Issues

### Définition d'une Issue

Dans notre application, une **Issue** représente un élément de travail à réaliser. Elle peut être de 3 types :

1. **Task** : Tâche à effectuer
2. **Bug** : Problème à corriger
3. **Feature** : Nouvelle fonctionnalité à développer

### Modèle de Données

```javascript
Issue {
  id: UUID (auto-généré),
  title: String (obligatoire, 3-100 caractères),
  description: Text (optionnel),
  type: ENUM('task', 'bug', 'feature'), // Type d'issue
  priority: ENUM('low', 'medium', 'high', 'critical'),
  status: ENUM('todo', 'in_progress', 'in_review', 'done'),
  assignedTo: String (optionnel),
  createdBy: UUID (référence User),
  teamCode: String,
  position: Integer (pour l'ordre dans le Kanban),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### US-005 : Créer une issue (5 points)

**Description :**  
En tant qu'utilisateur, je veux créer une issue pour ajouter un élément de travail.

**Implémentation :**
- Modale "Create New Issue" accessible depuis le Board
- Formulaire avec validation complète
- Champs :
  - **Title** : Texte obligatoire
  - **Description** : Textarea optionnel
  - **Type** : Dropdown (task, bug, feature)
  - **Priority** : Dropdown (low, medium, high, critical)
  - **Assigné à** : Dropdown des membres de l'équipe
- Bouton "Create Issue"
- Validation avant envoi
- Ajout automatique dans la colonne "To Do"

**Critères d'acceptation :**
- ✅ Modale s'ouvre au clic sur "+ New Issue"
- ✅ Tous les champs validés
- ✅ Issue créée en base de données
- ✅ Issue apparaît dans le Board
- ✅ Notification de succès

**Statut :** ✅ TERMINÉ

---

### US-006 : Voir toutes les issues (3 points)

**Description :**  
En tant qu'utilisateur, je veux voir toutes les issues de mon équipe dans le Board.

**Implémentation :**
- Board Kanban avec 4 colonnes
- Affichage de toutes les issues de l'équipe
- Regroupement par status (colonnes)
- Tri par position (ordre défini par drag & drop)
- Badge coloré selon le type
- Compteur d'issues par colonne

**Critères d'acceptation :**
- ✅ Toutes les issues affichées
- ✅ Regroupées par status
- ✅ Badge coloré visible
- ✅ Compteur correct
- ✅ Refresh automatique

**Statut :** ✅ TERMINÉ

---

### US-007 : Voir détails d'une issue (3 points)

**Description :**  
En tant qu'utilisateur, je veux voir les détails d'une issue pour comprendre le contexte.

**Implémentation :**
- Modale "Issue Details" au clic sur une carte
- Affichage de tous les champs
- Informations affichées :
  - Titre
  - Description complète
  - Type avec badge
  - Priorité avec badge
  - Status
  - Assigné à
  - Créé par
  - Date de création
- Bouton "Edit" pour modifier
- Bouton "Close" pour fermer

**Critères d'acceptation :**
- ✅ Modale s'ouvre au clic sur carte
- ✅ Toutes les infos affichées
- ✅ Design cohérent
- ✅ Boutons fonctionnels

**Statut :** ✅ TERMINÉ

---

### US-008 : Modifier une issue (3 points)

**Description :**  
En tant qu'utilisateur, je veux modifier une issue pour corriger ou mettre à jour les informations.

**Implémentation :**
- Modale "Edit Issue" avec formulaire pré-rempli
- Modification de tous les champs
- Changement de status possible
- Changement d'assignation
- Validation avant sauvegarde
- Mise à jour en base de données
- Mise à jour visuelle dans le Board

**Critères d'acceptation :**
- ✅ Formulaire pré-rempli avec données actuelles
- ✅ Tous les champs modifiables
- ✅ Validation correcte
- ✅ Sauvegarde en DB
- ✅ Board mis à jour
- ✅ Notification de succès

**Statut :** ✅ TERMINÉ

---

### US-009 : Supprimer une issue (2 points)

**Description :**  
En tant qu'utilisateur, je veux supprimer une issue pour nettoyer les éléments obsolètes.

**Implémentation :**
- Bouton "Delete" dans la modale d'édition
- Modal de confirmation ("Êtes-vous sûr ?")
- Suppression en base de données
- Retrait de la carte du Board
- Notification de succès

**Critères d'acceptation :**
- ✅ Bouton visible dans modale edit
- ✅ Confirmation demandée
- ✅ Suppression en DB
- ✅ Carte disparaît du Board
- ✅ Message de confirmation

**Statut :** ✅ TERMINÉ

**Total Issues : 16 points**

---

## 🎨 Fonctionnalité 3 : Board Kanban

### Définition du Board

Le Board Kanban est le cœur de l'application. Il permet de visualiser toutes les issues de l'équipe et de les gérer visuellement avec un système de drag & drop.

### Architecture du Board

**4 Colonnes définies :**

1. **To Do** (À faire) - Status : `todo`
   - Issues qui n'ont pas encore été commencées
   - Couleur : Gris clair
   
2. **In Progress** (En cours) - Status : `in_progress`
   - Issues actuellement en développement
   - Couleur : Bleu
   
3. **In Review** (En révision) - Status : `in_review`
   - Issues terminées, en attente de validation
   - Couleur : Vert clair
   
4. **Done** (Terminé) - Status : `done`
   - Issues complètement terminées et validées
   - Couleur : Vert

### US-010 : Affichage du Board (5 points)

**Description :**  
En tant qu'utilisateur, je veux voir un Board Kanban pour visualiser l'état du projet.

**Implémentation :**
- Page principale de l'application
- 4 colonnes côte à côte
- Header de colonne avec :
  - Titre de la colonne
  - Compteur d'issues
- Cartes d'issues empilées dans chaque colonne
- Scroll vertical si beaucoup d'issues
- Responsive (scroll horizontal sur mobile)
- Bouton "+ New Issue" en haut
- Bouton "Toutes les issues" pour vue alternative
- Bouton "Refresh" pour recharger

**Critères d'acceptation :**
- ✅ 4 colonnes affichées
- ✅ Issues dans les bonnes colonnes
- ✅ Compteurs corrects
- ✅ Interface responsive
- ✅ Boutons fonctionnels

**Statut :** ✅ TERMINÉ

---

### US-011 : Cartes d'issues (3 points)

**Description :**  
En tant qu'utilisateur, je veux voir des cartes visuelles pour chaque issue.

**Implémentation :**
- Design de carte épuré et moderne
- Informations affichées sur la carte :
  - **Titre** en gras
  - **Type** avec badge coloré (task/bug/feature)
  - **Numéro** de l'issue (#11, #12, etc.)
  - **Barre colorée** en bas selon le type
- Couleurs des badges :
  - Task : Orange
  - Bug : Rouge
  - Feature : Vert
- Hover effect (légère élévation)
- Cursor pointer pour indiquer cliquable

**Critères d'acceptation :**
- ✅ Design cohérent
- ✅ Toutes les infos visibles
- ✅ Badges colorés
- ✅ Barre de type colorée
- ✅ Interactif (hover, click)

**Statut :** ✅ TERMINÉ

---

### US-012 : Drag & Drop (8 points)

**Description :**  
En tant qu'utilisateur, je veux glisser-déposer les issues entre colonnes pour changer leur status.

**Implémentation :**

**Technology :** React DnD (Drag and Drop library)

**Fonctionnement :**
1. User clique et maintient sur une carte
2. Carte devient semi-transparente (feedback visuel)
3. User déplace la souris vers une autre colonne
4. Colonne cible s'illumine (dropzone active)
5. User relâche la souris
6. Carte se déplace dans la nouvelle colonne
7. Requête API PATCH envoyée : `/api/issues/:id/status`
8. Backend met à jour le status et la position dans PostgreSQL
9. Frontend se met à jour (state React)

**Détails techniques :**
- Composants draggable (cartes)
- Composants droppable (colonnes)
- Gestion de l'état pendant le drag
- Animation fluide
- Mise à jour optimiste (UI update avant réponse serveur)
- Rollback si erreur API

**Endpoints API :**
```
PATCH /api/issues/:id/status
Body: {
  status: "in_progress",
  position: 2
}
```

**Critères d'acceptation :**
- ✅ Drag & drop fonctionne entre toutes les colonnes
- ✅ Animation fluide
- ✅ Feedback visuel clair
- ✅ Status mis à jour en DB
- ✅ Position sauvegardée
- ✅ Pas de bugs de synchronisation
- ✅ Réorganisation dans la même colonne possible

**Statut :** ✅ TERMINÉ

---

### US-013 : Filtres et boutons (3 points)

**Description :**  
En tant qu'utilisateur, je veux des boutons d'action pour gérer le Board.

**Implémentation :**
- **Bouton "+ New Issue"** : Ouvre la modale de création
- **Bouton "Toutes les issues"** : Affiche une vue liste (alternative au Board)
- **Bouton "Refresh"** : Recharge les issues depuis la DB
- Menu utilisateur en haut à droite :
  - Nom de l'utilisateur + rôle
  - Option "Mon profil"
  - Option "Se déconnecter"

**Critères d'acceptation :**
- ✅ Boutons visibles et accessibles
- ✅ Actions fonctionnelles
- ✅ Menu utilisateur opérationnel
- ✅ Navigation fluide

**Statut :** ✅ TERMINÉ

**Total Board Kanban : 19 points**

---

## Architecture Technique

### Stack Technique

**Frontend :**
- **Framework** : React 19
- **Build Tool** : Vite
- **UI** : CSS personnalisé + composants custom
- **Drag & Drop** : React DnD
- **HTTP Client** : Axios
- **Routing** : React Router v6
- **State Management** : React Context API + useState

**Backend :**
- **Runtime** : Node.js 22
- **Framework** : Express.js 5
- **ORM** : Sequelize
- **Base de données** : PostgreSQL 15
- **Authentification** : JSON Web Tokens (JWT)
- **Sécurité** : bcrypt, cors, helmet
- **Validation** : express-validator

**DevOps :**
- **Versioning** : Git + GitHub
- **Dépôts** : 2 repos (développement + release)
- **Communication** : Slack
- **Documentation** : Markdown

### Architecture Backend

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuration Sequelize
│   ├── controllers/
│   │   ├── authController.js    # Authentification
│   │   ├── issueController.js   # Gestion des issues
│   │   └── userController.js    # Gestion des users
│   ├── models/
│   │   ├── User.js              # Modèle User
│   │   └── Issue.js             # Modèle Issue
│   ├── routes/
│   │   ├── authRoutes.js        # Routes auth
│   │   ├── issueRoutes.js       # Routes issues
│   │   └── userRoutes.js        # Routes users
│   ├── middlewares/
│   │   ├── authMiddleware.js    # Vérification JWT
│   │   └── validation.js        # Validation des données
│   └── server.js                # Point d'entrée
├── .env                         # Variables d'environnement
└── package.json
```

### Architecture Frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── Board/
│   │   │   ├── Board.jsx        # Composant principal
│   │   │   ├── Column.jsx       # Colonne droppable
│   │   │   └── IssueCard.jsx    # Carte draggable
│   │   ├── Modals/
│   │   │   ├── CreateIssueModal.jsx
│   │   │   ├── EditIssueModal.jsx
│   │   │   └── IssueDetailsModal.jsx
│   │   ├── Profile/
│   │   │   └── Profile.jsx
│   │   └── Header/
│   │       └── Header.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx      # État auth
│   │   └── IssueContext.jsx     # État issues
│   ├── services/
│   │   ├── authService.js       # API auth
│   │   └── issueService.js      # API issues
│   ├── utils/
│   │   └── validation.js
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

### Base de Données PostgreSQL

**Tables créées :**

1. **users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Hash bcrypt
  role VARCHAR(50) DEFAULT 'developer',
  team_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

2. **issues**
```sql
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL, -- 'task', 'bug', 'feature'
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'todo',
  assigned_to VARCHAR(100),
  created_by UUID REFERENCES users(id),
  team_code VARCHAR(10),
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Tests Réalisés

### Tests Manuels - Authentification

| Test | Résultat |
|------|----------|
| Créer un compte avec email valide | ✅ Pass |
| Créer un compte avec email invalide | ✅ Pass (erreur affichée) |
| Créer un compte avec mot de passe faible | ✅ Pass (erreur affichée) |
| Se connecter avec bons identifiants | ✅ Pass |
| Se connecter avec mauvais identifiants | ✅ Pass (erreur affichée) |
| Session persistante après refresh | ✅ Pass |
| Déconnexion et redirection | ✅ Pass |

### Tests Manuels - Issues

| Test | Résultat |
|------|----------|
| Créer une issue type "task" | ✅ Pass |
| Créer une issue type "bug" | ✅ Pass |
| Créer une issue type "feature" | ✅ Pass |
| Voir détails d'une issue | ✅ Pass |
| Modifier une issue | ✅ Pass |
| Supprimer une issue avec confirmation | ✅ Pass |
| Annuler la suppression | ✅ Pass |

### Tests Manuels - Board Kanban

| Test | Résultat |
|------|----------|
| Affichage des 4 colonnes | ✅ Pass |
| Compteurs corrects par colonne | ✅ Pass |
| Cartes affichées avec bon design | ✅ Pass |
| Badges colorés selon le type | ✅ Pass |
| Drag & drop : To Do → In Progress | ✅ Pass |
| Drag & drop : In Progress → In Review | ✅ Pass |
| Drag & drop : In Review → Done | ✅ Pass |
| Drag & drop : Done → To Do (retour arrière) | ✅ Pass |
| Réorganisation dans la même colonne | ✅ Pass |
| Position sauvegardée après refresh | ✅ Pass |
| Drag & drop sur mobile (tactile) | ✅ Pass |

### Tests de Validation

| Test | Résultat |
|------|----------|
| Validation email (format) | ✅ Pass |
| Validation mot de passe (force) | ✅ Pass |
| Validation titre issue (longueur) | ✅ Pass |
| Protection routes (JWT) | ✅ Pass |
| Gestion erreurs 404 | ✅ Pass |
| Gestion erreurs 500 | ✅ Pass |

### Tests Cross-Browser

| Navigateur | Résultat |
|------------|----------|
| Chrome 120+ | ✅ Pass |
| Firefox 121+ | ✅ Pass |
| Edge 120+ | ✅ Pass |
| Safari 17+ | ✅ Pass |

### Tests Responsive

| Device | Résultat |
|--------|----------|
| Desktop (1920x1080) | ✅ Pass |
| Laptop (1366x768) | ✅ Pass |
| Tablette (768x1024) | ✅ Pass |
| Mobile (375x667) | ✅ Pass |

---

## 📊 Métriques du Sprint

### Productivité

- **Durée** : 1 semaine
- **Points planifiés** : 48 points
- **Points réalisés** : 48 points
- **Vélocité** : 8 points/semaine
- **Taux de complétion** : 100%

### Qualité

- **Bugs critiques** : 0
- **Bugs mineurs** : 4 (tous corrigés)
- **Code reviews** : 100% des PR
- **Tests manuels** : 35 scénarios validés

### Collaboration

- **Daily meetings** : 3 réunions 
- **Commits** : 152 commits (Dans nos propres Git)
- **Pull Requests** : 28 PR

---

## Rétrospective

### Ce qui a bien fonctionné

**Technique :**
- React DnD : Library performante et stable pour le drag & drop
- Sequelize : ORM facilitant les migrations et requêtes SQL
- JWT : Authentification simple et sécurisée
- Context API : Gestion d'état suffisante pour le projet

**Organisation :**
- Communication quotidienne efficace sur Slack
- Code reviews systématiques (qualité++)
- Répartition claire des responsabilités
- Documentation continue

**Résultats :**
- 100% des objectifs atteints
- Board Kanban impressionnant et fluide
- Interface moderne et intuitive
- Aucun bug bloquant

### Ce qui peut être amélioré

**Technique :**
- Commencer les tests automatisés (Jest, Cypress)
- Implémenter des tests unitaires backend
- Améliorer la gestion d'erreur réseau
- Ajouter plus de loading states

**Organisation :**
- Estimer plus précisément les tâches complexes
- Faire des démos intermédiaires plus fréquentes
- Documenter les décisions techniques immédiatement

**Features :**
- Ajouter des filtres sur le Board (par type, priorité)
- Implémenter des notifications en temps réel
- Ajouter un historique des modifications

### Actions pour le Sprint 3

1. **Tests automatisés** : Implémenter Jest (backend) + Cypress (E2E)
2. **Module Releases** : Gestion des versions et livraisons
3. **Module Tests** : Gestion des tests QA et rapports
4. **Documentation intégrée** : Éditeur Markdown dans l'app
5. **Rapports automatiques** : Génération de rapports de sprint
6. **Améliorations Board** :
   - Filtres avancés
   - Recherche d'issues
   - Vue liste alternative
   - Export PDF du Board

---

##  Conclusion

Le Sprint 2 a été un **succès complet**. Nous avons livré un MVP fonctionnel avec toutes les fonctionnalités essentielles et un Board Kanban professionnel qui dépasse les attentes.

### Réalisations Clés

✅ **48 points livrés** (100% de vélocité)  
✅ **Authentification complète** et sécurisée  
✅ **Gestion CRUD** complète des Issues  
✅ **Board Kanban** avec drag & drop fluide  
✅ **4 colonnes** pour le workflow complet  
✅ **Interface moderne** et responsive  
✅ **Architecture solide** et scalable  
✅ **0 bugs critiques**  

### État du Projet

Le SaaS "AMA" dispose maintenant d'une base technique solide et des fonctionnalités core complètes. Le Board Kanban est la fonctionnalité phare qui démontre notre capacité à livrer un produit de qualité professionnelle.

**Prochaine étape :** Sprint 3 pour compléter les modules avancés (Releases, Tests, Documentation) et livraison finale le 16 décembre.

---

## Annexes

### Technologies et Versions

- Node.js: 22.x
- React: 19.x
- Vite: 5.x
- Express: 5.x
- Sequelize: 6.x
- PostgreSQL: 15.x
- React DnD: 16.x

### Liens Utiles

- **Dépôt Dev** : `cdp-project-developpement`
- **Dépôt Release** : `cdp-projet-release`
- **Canal Slack** : `#cdp-projet`

---

**Date de rédaction :** 19 Novembre 2025  
**Version :** 1.0  
**Statut :** ✅ TERMINÉ  
