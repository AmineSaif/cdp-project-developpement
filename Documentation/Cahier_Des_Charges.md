# Spécifications Fonctionnelles - Outil de Gestion de Production Logicielle

## 1. Introduction

### 1.1 Objectif du document
Ce document décrit les spécifications fonctionnelles et techniques de l’outil de gestion de production logicielle,
permettant la planification, le suivi et la documentation de projets informatiques.

### 1.2 Portée
L’application vise à :
- Gérer les utilisateurs, issues, tâches, releases, tests, documentation et rapports.
- Offrir une interface intuitive et responsive.
- Permettre le suivi d’activité d’une équipe de développement.

### 1.3 Public visé
- **Utilisateurs** : membres de l’équipe de développement
- **Product Owner**

---

## 2. Description Générale

| Élément | Description |
|----------|--------------|
| **Architecture** | Front-end (React) + API REST Express.js (Node.js) + base PostgreSQL
| **Utilisateurs** | Authentifiés via JWT |
| **Modules principaux** | Authentification, Issues, Tâches, Releases, Tests, Documentation, Rapports |
| **UI/UX** | Responsive, thème clair/sombre, navigation fluide |
| **Sécurité** | Hash des mots de passe (BCrypt), rôles, validation côté serveur et client |

---

## 3. Spécifications Fonctionnelles

### 3.1 Gestion des Utilisateurs
- Inscription, connexion, déconnexion (US-001 → US-003)
- Consultation du profil (US-004)
- Rôles : Administrateur / Membre / Lecteur
- Authentification via JWT et refresh tokens

### 3.2 Gestion des Issues
- CRUD complet (US-005 → US-010)
- Statuts : *open*, *in_progress*, *resolved*, *closed*
- Filtres multi-critères, recherche textuelle
- Historique et commentaires (US-040)
- Suppression en cascade avec les tâches liées

### 3.3 Gestion des Tâches
- CRUD complet (US-011 → US-015)
- Statuts : *todo*, *in_progress*, *done*
- Lien obligatoire avec une issue
- Suivi du temps estimé / passé

### 3.4 Dashboard & Navigation
- Vue synthétique : issues par statut, tâches en cours, graphiques (US-016)
- Menu de navigation clair et responsive (US-017)

### 3.5 Gestion des Releases
- Planification et suivi de versions (US-018 → US-023)
- Association d’issues à une version
- Génération automatique de notes de version (Markdown)

### 3.6 Gestion des Tests
- Création et exécution de tests (US-024 → US-028)
- Types : unitaire, intégration, manuel
- Association à une issue et rapport d’exécution

### 3.7 Gestion de la Documentation
- Éditeur Markdown (US-029 → US-033)
- Classement technique / utilisateur
- Versioning et export PDF/Markdown/HTML

### 3.8 Rapports & Statistiques
- Génération de rapports de sprint (US-034)
- Statistiques globales et graphiques de performance (US-035)
- Répartition de la charge de travail (US-036)

### 3.9 Améliorations UX/UI
- Design responsive (US-037)
- Notifications (US-038)
- Mode sombre (US-039)

### 3.10 Fonctionnalités Bonus
- Intégration Git (US-041/042)
- Projets et labels (US-043/044)
- Vue Kanban (US-045)

---

## 4. Spécifications Techniques

| Domaine | Détails |
|----------|----------|
| **Backend** | Node.js 22, Express.js 5.18, JWT Authentication, Sequelize ORM (PostgreSQL)
| **Frontend** | React 19, TailwindCSS |
| **Base de données** | PostgreSQL 15 |
| **Tests** | JUnit + Mockito / Cypress ou Jest |
| **Documentation API** | Swagger / OpenAPI 3 |

---

## 5. Contraintes & Exigences Non-Fonctionnelles
- **Scalabilité** : architecture REST stateless
- **Sécurité** : HTTPS, validation des entrées

---
## 6. Plan de Développement

| Sprint | Modules Livrés | Objectif |
|---------|----------------|-----------|
| **Sprint 1** | Authentification, Structure du projet, Base de données, Gestion partielle des Issues | Mettre en place les fondations techniques et les premières fonctionnalités essentielles |
| **Sprint 2** | Gestion complète des Issues et Tâches, Dashboard, Navigation | Obtenir un **MVP fonctionnel** avec la gestion de base du travail d’équipe |
| **Sprint 3** | Releases, Tests, Documentation, Rapports | Compléter les fonctionnalités principales et assurer la qualité logicielle |
| **Sprint 4** *(optionnel)* | Améliorations UX/UI, Notifications, Git intégration, Vue Kanban | Optimisation, polish final et extensions optionnelles |

## 7. Génération du Rapport de Test

La gestion et la génération des rapports de tests sont intégrées directement dans l’application SaaS.

### Définition et exécution des tests
- Les **développeurs** créent et exécutent les **tests unitaires** et **tests d’intégration** pendant le développement.  
- Le **chef de projet** ou le **client** peut ajouter des **tests manuels d’acceptation** via l’interface dédiée.  
- Chaque test est associé à une **issue** ou une **release**.

### Génération du rapport
- Le **rapport de test** est **généré automatiquement** par le système SaaS.  
- L’utilisateur (client ou chef de projet) peut :
  - Sélectionner une **release** ou une **période** spécifique.
  - Filtrer les tests par **type**, **statut**, ou **responsable**.  
- Le rapport contient :
  - Nombre total de tests (unitaires, intégration, manuels)  
  - Résultats détaillés (`passed` / `failed`)  
  - Taux de réussite global (%)  
  - Liste des issues liées aux tests échoués  
  - Date d’exécution et version concernée  
- Formats disponibles : **PDF** et **Markdown**, téléchargeables ou consultables directement depuis l’application.  
- Les rapports sont **archivés automatiquement** dans le cloud pour assurer la traçabilité.  
- La **validation finale** du rapport est effectuée par le **client** via l’interface web.

---

## 8. Format des Livrables (Modèle SaaS)

| Type de livrable | Description | Format / Mode de livraison | Produit par |
|------------------|--------------|-----------------------------|--------------|
| **Application SaaS** | Plateforme web hébergée (API + Front-end + Base de données) | Accessible en ligne | Équipe projet |
| **Documentation technique** | Endpoints API REST, schéma de base de données, logique applicative | Intégrée dans l’application (section “Documentation”) + export PDF/Markdown | Développeurs |
| **Documentation utilisateur** | Aide en ligne, guides et tutoriels | Section “Aide / Support” du SaaS + export PDF | Équipe projet |
| **Rapport de tests** | Résultats des tests exécutés et taux de réussite | Généré automatiquement par le SaaS (PDF / Markdown) | Application / Chef de projet |
| **Rapports de sprint** | Synthèse de l’avancement et des performances | Générés automatiquement dans l’application | Application / Équipe projet |
| **Dashboard de pilotage** | Vue temps réel des issues, tâches, releases et tests | Accessible via interface SaaS | Application |
| **Sauvegarde des données** | Backup périodique de la base PostgreSQL | Stockage cloud sécurisé (format `.sql` / `.dump`) | Application |



---
**Dernière révision : Octobre 2025**
