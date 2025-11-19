# **Sprint 0 \- Phase Préparatoire**

**Période :** du 15 Octobre jusqu'au mercredi 24 Octobre  
 **Équipe :** Saif Amine, Ameziane Adnane

## **Objectifs du Sprint 0**

Le Sprint 0 vise à poser les fondations solides du projet avant de commencer le développement. Les objectifs principaux sont :

1. **Mise en place de l'environnement de travail**  
2. **Définition de l'architecture technique**  
3. **Création du backlog initial**  
4. **Organisation des outils de communication et de gestion**  
5. **Planification des sprints suivants**

## **Tâches Réalisées**

### **1\. Organisation de l'Équipe**

**Rôles définis :**

* **Product Owner :** Professeur \- Responsable du backlog et des priorités  
* **Équipe de développement :** Saif Amine & Ameziane Adnane  
  * Développement Full-Stack (Frontend & Backend)  
  * Gestion agile partagée  
  * Documentation et tests

**Communication :**

* Canal Slack créé et configuré  
* Réunions quotidiennes : 15 min chaque matin à 19h  
* Rétrospective de sprint : dernier jour de chaque sprint

### **2\. Configuration des Dépôts Git**

**Dépôt Développement :**

* Repository créé : `cdp-project-developpement`  
* Structure des branches :  
  * `main` : branche principale stable  
  * `develop` : branche de développement  
  * `feature/*` : branches pour chaque fonctionnalité  
  * `bugfix/*` : branches pour les corrections

**Dépôt Release :**

* Repository créé : `cdp-projet-release`  
* Structure créée :  
  /README.md  
    /Backlog.md  
    /Sprint0.md (ce document)  
    /Tasks0.md  
    /Release.md  
    /Documentation.md

**Convention de commits :**

* `feat:` pour une nouvelle fonctionnalité  
* `fix:` pour une correction de bug  
* `docs:` pour la documentation  
* `refactor:` pour du refactoring  
* `test:` pour les tests

### **3\. Stack Technique Choisie**

Après analyse des besoins et des compétences de l'équipe, voici la stack retenue :

#### **Frontend**

* **Framework :** React.js 18+ avec Vite  
* **Langage :** JavaScript (ES6+) / TypeScript (optionnel)  
* **UI Library :** Material-UI (MUI) \- composants prêts à l'emploi  
* **Routing :** React Router v6  
* **State Management :** React Context API \+ useState/useReducer  
* **HTTP Client :** Axios

**Justification :** React est moderne, largement documenté, et permet un développement rapide avec une courbe d'apprentissage raisonnable.

#### **Backend**

* **Framework :** Node.js \+ Express.js  
* **Langage :** JavaScript (ES6+)  
* **Validation :** Express-validator  
* **Authentification :** JSON Web Tokens (JWT)

**Justification :** Node.js permet de rester sur JavaScript pour tout le projet, facilitant la collaboration et le partage de code.

#### **Base de Données**

* **SGBD :** PostgreSQL 15+  
* **ORM :** Sequelize  
* **Migrations :** Sequelize CLI

**Justification :** PostgreSQL est robuste, gratuit, et bien adapté pour gérer des relations complexes (issues, tâches, releases, tests).

#### **Outils de Développement**

* **Gestion de versions :** Git \+ GitHub  
* **IDE recommandé :** Visual Studio Code  
* **Extensions VSCode :**  
  * ESLint  
  * Prettier  
  * GitLens  
  * Thunder Client (test API)  
* **Documentation :** Markdown \+ JSDoc pour le code

### **4\. Architecture du Projet**

#### **Architecture Globale**

![][image1]

#### **Structure du Frontend**

/src  
  /components   	\# Composants réutilisables  
  /pages       	\# Pages de l'application  
  /services    	\# Services API  
  /contexts    	\# Contextes React  
  /utils       	\# Fonctions utilitaires  
  /assets      	\# Images, styles  
  App.js       	\# Composant principal  
  index.js     	\# Point d'entrée

**Structure du Backend**  
/src  
  /controllers 	\# Logique métier  
  /models      	\# Modèles de données (Sequelize)  
  /routes      	\# Définition des routes API  
  /middlewares 	\# Middlewares (auth, validation)  
  /config      	\# Configuration (DB, JWT)  
  /utils       	\# Fonctions utilitaires  
  server.js    	\# Point d'entrée

### **5\. Modèle de Données Initial**

#### **Entités Principales**

**Issue (Ticket)**

* id (PK)  
* titre  
* description  
* type (bug, feature, task)  
* priorité (low, medium, high, critical)  
* statut (open, in\_progress, resolved, closed)  
* créateur\_id (FK User)  
* assigné\_à\_id (FK User)  
* date\_création  
* date\_mise\_à\_jour

**Task (Tâche)**

* id (PK)  
* titre  
* description  
* statut (todo, in\_progress, done)  
* issue\_id (FK Issue)  
* assigné\_à\_id (FK User)  
* estimation (en heures)  
* temps\_passé  
* date\_début  
* date\_fin

**Release (Version)**

* id (PK)  
* version (ex: 1.0.0)  
* nom  
* description  
* date\_release  
* statut (planned, in\_progress, released)  
* notes\_release

**Test**

* id (PK)  
* nom  
* description  
* type (unitaire, intégration, manuel)  
* statut (passed, failed, pending)  
* issue\_id (FK Issue)  
* date\_exécution

**User (Utilisateur)**

* id (PK)  
* nom  
* email  
* mot\_de\_passe (hashé)  
* rôle (admin, developer, tester)

**Documentation**

* id (PK)  
* titre  
* contenu  
* type (technique, utilisateur,admin)  
* version  
* date\_création

### **6\. Backlog Initial Priorisé**

Voir le fichier `Backlog.md` pour la liste complète. Voici les user stories prioritaires :

#### **Sprint 1 (Priorité HAUTE)**

1. En tant qu'utilisateur, je veux créer un compte et me connecter  
2. En tant qu'utilisateur, je veux créer une issue  
3. En tant qu'utilisateur, je veux lister toutes les issues  
4. En tant qu'utilisateur, je veux voir les détails d'une issue  
5. En tant qu'utilisateur, je veux créer une tâche liée à une issue  
6. En tant qu'utilisateur, je veux modifier le statut d'une tâche

#### **Sprint 2 (Priorité MOYENNE)**

7. En tant qu'utilisateur, je veux créer une release  
8. En tant qu'utilisateur, je veux associer des issues à une release  
9. En tant qu'utilisateur, je veux créer un test  
10. En tant qu'utilisateur, je veux exécuter et documenter un test  
    

#### **Sprint 3 (Priorité BASSE)**

11. En tant qu'utilisateur, je veux créer de la documentation  
12. En tant qu'utilisateur, je veux générer un rapport de sprint  
13. En tant qu'utilisateur, je veux visualiser des statistiques  
14. En tant qu'utilisateur, je veux exporter les données

### **7\. Environnement de Développement**

**Installation Frontend :**

\# Créer le projet React avec Vite

npm create vite@latest frontend \-- \--template react

cd frontend

npm install

\# Installer les dépendances

npm install @mui/material @emotion/react @emotion/styled

npm install react-router-dom

npm install axios

npm install react-hook-form

**Installation Backend :**

\# Initialiser le projet  
mkdir backend && cd backend  
npm init \-y

\# Installer les dépendances  
npm install express  
npm install pg sequelize  
npm install jsonwebtoken bcrypt  
npm install cors dotenv  
npm install express-validator

\# Dépendances de développement  
npm install \--save-dev nodemon

**Configuration PostgreSQL :**

* Base de données : `gestion_projet_db`  
* Utilisateur : `projet_user`  
* Port : 5432 (par défaut)

**8\. Planning des Sprints**

| Sprint | Dates | Objectifs Principaux |
| :---: | :---: | :---: |
| **Sprint 0** | 15 Oct \- 24 Oct | Setup et architecture |
| **Sprint 1** | 25 Nov \- 5 Nov | Issues \+ Tâches \+ Auth |
| **Sprint 2** | 6 Nov \- 20 Nov | Tests \+ Releases |
| **Sprint 3** | 4 Déc \- 16 Déc | Documentation \+ Finalisations |
| **Soutenance** | 16 Décembre | Présentation finale |

## **Definition of Done (DoD)**

Pour considérer une fonctionnalité comme terminée :

* Code développé et fonctionnel  
* Tests réalisés (au moins tests manuels)  
* Code reviewé par un autre membre de l'équipe  
* Documentation technique mise à jour  
* Commit et push sur la branche appropriée  
* Merge sur `develop` après validation

## **Conventions et Bonnes Pratiques**

### **Code**

* Nommage en anglais pour le code (variables, fonctions, composants)  
* Nommage en français pour la documentation et les commentaires  
* Indentation : 2 espaces  
* Point-virgule obligatoire en JavaScript

### **Git**

* Commits fréquents et atomiques  
* Messages de commit clairs et descriptifs  
* Pull request obligatoire pour merge sur `main`  
* Revue de code par au moins un membre

### **Workflow**

1. Créer une branche depuis `develop`  
2. Développer la fonctionnalité  
3. Tester localement  
4. Commit et push  
5. Créer une Pull Request  
6. Revue de code  
7. Merge après validation

## **Prochaines Étapes (Sprint 1\)**

**À démarrer dès le 25 Novembre :**

1. Initialiser les projets frontend et backend  
2. Configurer la base de données PostgreSQL  
3. Implémenter l'authentification (JWT)  
4. Créer les premières routes API  
5. Développer les composants React de base  
6. Implémenter la gestion des issues

## **Membres de l'Équipe**

| Nom | Responsabilités |
| :---: | ----- |
| **Saif Amine** | Développement Full-Stack, Architecture Backend, Base de données |
| **Ameziane Adnane** | Développement Full-Stack, Architecture Frontend, UI/UX |

**Date de rédaction :** 10/20/2025  
**Version :** 1.0  
**Statut :**  Terminé

[image1]: <data:image/png;base64,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>