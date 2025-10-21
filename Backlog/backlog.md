# Product Backlog - Outil de Gestion de Production Logicielle

**Projet :** Outil de Gestion de Projet (Project Management Tool)  
**Équipe :** Saif Amine & Ameziane Adnane  
**Dernière mise à jour :** Octobre 2025

---

## Vue d'Ensemble

Ce backlog contient l'ensemble des fonctionnalités à développer pour créer un outil complet de gestion de la production logicielle. Les user stories sont organisées par sprint et priorisées selon la valeur métier et les dépendances techniques.

**Légende des Priorités :**
- **CRITIQUE** : Fonctionnalité essentielle, bloquante pour la suite
- **HAUTE** : Fonctionnalité importante, forte valeur ajoutée
- **MOYENNE** : Fonctionnalité utile, améliore l'expérience
- **BASSE** : Fonctionnalité bonus, nice-to-have

**Estimation :** Complexité en points (1 = Simple, 3 = Moyen, 5 = Complexe, 8 = Très complexe)

---

## Sprint 1 - Fondations et Gestion des Issues/Tâches
**Objectif :** Créer les fonctionnalités de base pour gérer les issues et les tâches

### Authentification et Gestion des Utilisateurs

| ID | User Story | Priorité | Points | Critères d'Acceptation |
|----|------------|----------|--------|------------------------|
| US-001 | **En tant qu'utilisateur, je veux créer un compte** pour accéder à l'application | CRITIQUE | 3 | - Formulaire d'inscription avec nom, email, mot de passe<br>- Validation des champs (email valide, mot de passe fort)<br>- Hash du mot de passe en base<br>- Message de confirmation |
| US-002 | **En tant qu'utilisateur, je veux me connecter** pour accéder à mes projets | CRITIQUE | 3 | - Formulaire de connexion (email + mot de passe)<br>- Génération d'un token JWT<br>- Redirection vers le dashboard<br>- Gestion des erreurs (identifiants incorrects) |
| US-003 | **En tant qu'utilisateur, je veux me déconnecter** pour sécuriser mon compte | HAUTE | 1 | - Bouton de déconnexion visible<br>- Suppression du token<br>- Redirection vers la page de login |
| US-004 | **En tant qu'utilisateur, je veux voir mon profil** pour consulter mes informations | MOYENNE | 2 | - Page profil avec nom, email, rôle<br>- Nombre d'issues et tâches assignées<br>- Statistiques personnelles |

### Gestion des Issues (Tickets)

| ID | User Story | Priorité | Points | Critères d'Acceptation |
|----|------------|----------|--------|------------------------|
| US-005 | **En tant qu'utilisateur, je veux créer une issue** pour signaler un bug ou demander une fonctionnalité | CRITIQUE | 5 | - Formulaire avec : titre, description, type (bug/feature/task)<br>- Sélection de la priorité (low/medium/high/critical)<br>- Assignation optionnelle à un membre<br>- Création avec statut "open" par défaut<br>- Enregistrement en base de données |
| US-006 | **En tant qu'utilisateur, je veux voir la liste de toutes les issues** pour avoir une vue d'ensemble | CRITIQUE | 3 | - Tableau avec colonnes : ID, titre, type, priorité, statut, assigné<br>- Tri par colonne<br>- Pagination (20 issues par page)<br>- Badge coloré selon priorité |
| US-007 | **En tant qu'utilisateur, je veux filtrer les issues** pour trouver rapidement ce que je cherche | HAUTE | 3 | - Filtres par : type, priorité, statut, assigné<br>- Recherche par titre/description<br>- Combinaison de plusieurs filtres<br>- Réinitialisation des filtres |
| US-008 | **En tant qu'utilisateur, je veux voir les détails d'une issue** pour comprendre le contexte | CRITIQUE | 3 | - Page détaillée avec toutes les informations<br>- Historique des modifications<br>- Liste des tâches liées<br>- Commentaires (optionnel Sprint 1) |
| US-009 | **En tant qu'utilisateur, je veux modifier une issue** pour corriger ou mettre à jour les informations | HAUTE | 3 | - Modification de tous les champs<br>- Changement de statut (open → in_progress → resolved → closed)<br>- Horodatage de la modification<br>- Confirmation de sauvegarde |
| US-010 | **En tant qu'utilisateur, je veux supprimer une issue** pour nettoyer les tickets obsolètes | MOYENNE | 2 | - Bouton de suppression<br>- Modal de confirmation<br>- Suppression en cascade des tâches liées<br>- Message de confirmation |

### Gestion des Tâches

| ID | User Story | Priorité | Points | Critères d'Acceptation |
|----|------------|----------|--------|------------------------|
| US-011 | **En tant qu'utilisateur, je veux créer une tâche** pour décomposer une issue en actions concrètes | CRITIQUE | 5 | - Formulaire avec : titre, description, issue liée<br>- Assignation à un membre<br>- Estimation en heures<br>- Statut par défaut : "todo"<br>- Lien obligatoire avec une issue |
| US-012 | **En tant qu'utilisateur, je veux voir toutes mes tâches** pour organiser mon travail | CRITIQUE | 3 | - Vue liste de mes tâches assignées<br>- Tri par statut (todo, in_progress, done)<br>- Affichage de l'issue parente<br>- Indicateur d'estimation vs temps passé |
| US-013 | **En tant qu'utilisateur, je veux changer le statut d'une tâche** pour suivre ma progression | CRITIQUE | 2 | - Boutons de changement de statut<br>- Workflow : todo → in_progress → done<br>- Mise à jour de la date de début/fin<br>- Notification visuelle du changement |
| US-014 | **En tant qu'utilisateur, je veux modifier une tâche** pour ajuster les détails | HAUTE | 2 | - Modification de tous les champs<br>- Mise à jour du temps passé<br>- Changement d'assignation<br>- Historique des modifications |
| US-015 | **En tant qu'utilisateur, je veux supprimer une tâche** pour retirer une action devenue inutile | MOYENNE | 1 | - Bouton de suppression<br>- Confirmation avant suppression<br>- Message de succès |

### Dashboard et Navigation

| ID | User Story | Priorité | Points | Critères d'Acceptation |
|----|------------|----------|--------|------------------------|
| US-016 | **En tant qu'utilisateur, je veux un dashboard** pour avoir une vue synthétique de l'activité | HAUTE | 5 | - Nombre total d'issues par statut<br>- Nombre de tâches par statut<br>- Issues assignées à moi<br>- Tâches en cours<br>- Graphiques simples (barres/camembert) |
| US-017 | **En tant qu'utilisateur, je veux une navigation claire** pour accéder rapidement aux fonctionnalités | CRITIQUE | 2 | - Menu latéral ou top bar<br>- Liens : Dashboard, Issues, Tâches, Releases, Tests, Documentation<br>- Indication de la page active<br>- Responsive |

---

## Sprint 2 - Gestion des Releases et Tests
**Dates :** 6 Novembre - 19 Novembre  
**Objectif :** Ajouter la gestion des versions et des tests

### Gestion des Releases (Versions)

| ID | User Story | Priorité | Points | Critères d'Acceptation |
|----|------------|----------|--------|------------------------|
| US-018 | **En tant qu'utilisateur, je veux créer une release** pour planifier une version | CRITIQUE | 5 | - Formulaire : numéro de version (1.0.0), nom, description<br>- Date de release prévue<br>- Statut : planned/in_progress/released<br>- Notes de release (markdown) |
| US-019 | **En tant qu'utilisateur, je veux voir toutes les releases** pour suivre les versions | CRITIQUE | 3 | - Liste chronologique des releases<br>- Badge coloré par statut<br>- Nombre d'issues associées<br>- Date de release |
| US-020 | **En tant qu'utilisateur, je veux associer des issues à une release** pour définir le scope | CRITIQUE | 3 | - Sélection multiple d'issues<br>- Visualisation des issues de la release<br>- Retrait d'une issue de la release<br>- Indicateur de progression (issues résolues/total) |
| US-021 | **En tant qu'utilisateur, je veux voir les détails d'une release** pour comprendre son contenu | HAUTE | 3 | - Informations complètes<br>- Liste des issues incluses avec statut<br>- Notes de release formatées<br>- Statistiques (% complétion) |
| US-022 | **En tant qu'utilisateur, je veux modifier une release** pour ajuster la planification | HAUTE | 2 | - Modification de tous les champs<br>- Changement de statut<br>- Mise à jour des notes<br>- Horodatage |
| US-023 | **En tant qu'utilisateur, je veux générer les notes de release** pour communiquer les changements | MOYENNE | 3 | - Export automatique en markdown<br>- Liste des features, bugs fixés<br>- Contributeurs<br>- Bouton de copie |

### Gestion des Tests

| ID | User Story | Priorité | Points | Critères d'Acceptation |
|----|------------|----------|--------|------------------------|
| US-024 | **En tant qu'utilisateur, je veux créer un test** pour valider une fonctionnalité | CRITIQUE | 5 | - Formulaire : nom, description, type (unitaire/intégration/manuel)<br>- Lien avec une issue<br>- Étapes du test (pour tests manuels)<br>- Résultat attendu |
| US-025 | **En tant qu'utilisateur, je veux exécuter un test** pour vérifier qu'il passe | CRITIQUE | 3 | - Bouton d'exécution<br>- Saisie du résultat (passed/failed)<br>- Commentaires sur l'exécution<br>- Date et heure d'exécution<br>- Log des résultats |
| US-026 | **En tant qu'utilisateur, je veux voir tous les tests** pour suivre la qualité | HAUTE | 3 | - Liste des tests avec type et statut<br>- Filtres par type et résultat<br>- Issue associée<br>- Dernière exécution |
| US-027 | **En tant qu'utilisateur, je veux voir les détails d'un test** pour comprendre ce qui est testé | HAUTE | 2 | - Toutes les informations du test<br>- Historique des exécutions<br>- Taux de réussite<br>- Issue liée |
| US-028 | **En tant qu'utilisateur, je veux voir un rapport de tests** pour évaluer la couverture | MOYENNE | 3 | - Nombre de tests par type<br>- Taux de réussite global<br>- Tests échoués récents<br>- Graphique d'évolution |

---

## Sprint 3 - Documentation et Finalisation
**Dates :** 18 Décembre - 3 Décembre  
**Objectif :** Compléter la documentation et améliorer l'expérience utilisateur

### Gestion de la Documentation

| ID | User Story | Priorité | Points | Critères d'Acceptation |
|----|------------|----------|--------|------------------------|
| US-029 | **En tant qu'utilisateur, je veux créer une documentation** pour expliquer une fonctionnalité | CRITIQUE | 5 | - Éditeur markdown<br>- Titre et contenu<br>- Type : technique/utilisateur<br>- Catégorisation<br>- Prévisualisation du rendu |
| US-030 | **En tant qu'utilisateur, je veux voir toutes les documentations** pour trouver des infos | CRITIQUE | 3 | - Liste organisée par catégorie<br>- Recherche par titre/contenu<br>- Filtre par type<br>- Date de création/modification |
| US-031 | **En tant qu'utilisateur, je veux voir une documentation** pour lire son contenu | HAUTE | 2 | - Rendu markdown formaté<br>- Table des matières auto-générée<br>- Métadonnées (auteur, date, version)<br>- Bouton d'édition |
| US-032 | **En tant qu'utilisateur, je veux modifier une documentation** pour la mettre à jour | HAUTE | 2 | - Accès à l'éditeur<br>- Versioning automatique<br>- Prévisualisation<br>- Historique des modifications |
| US-033 | **En tant qu'utilisateur, je veux exporter la documentation** pour la partager | MOYENNE | 3 | - Export en PDF<br>- Export en markdown (zip)<br>- Export HTML<br>- Bouton de téléchargement |

### Rapports et Statistiques

| ID | User Story | Priorité | Points | Critères d'Acceptation |
|----|------------|----------|--------|------------------------|
| US-034 | **En tant qu'utilisateur, je veux générer un rapport de sprint** pour documenter l'avancement | CRITIQUE | 5 | - Sélection de la période (dates)<br>- Issues créées/résolues/fermées<br>- Tâches complétées<br>- Tests exécutés<br>- Vélocité de l'équipe<br>- Export PDF/Markdown |
| US-035 | **En tant qu'utilisateur, je veux voir des statistiques globales** pour analyser la productivité | HAUTE | 5 | - Graphiques : issues par statut, par type, par priorité<br>- Évolution dans le temps<br>- Burn-down chart (optionnel)<br>- Temps moyen de résolution |
| US-036 | **En tant qu'utilisateur, je veux visualiser la charge de travail** pour équilibrer les tâches | MOYENNE | 3 | - Tâches par membre<br>- Heures estimées vs passées<br>- Disponibilité<br>- Graphique de répartition |

### Améliorations UX/UI

| ID | User Story | Priorité | Points | Critères d'Acceptation |
|----|------------|----------|--------|------------------------|
| US-037 | **En tant qu'utilisateur, je veux un design responsive** pour utiliser l'app sur mobile | HAUTE | 5 | - Adaptation tablette et mobile<br>- Menu hamburger<br>- Tableaux scrollables<br>- Formulaires adaptés |
| US-038 | **En tant qu'utilisateur, je veux des notifications** pour être alerté des changements | MOYENNE | 3 | - Notification en cas d'assignation<br>- Changement de statut d'une issue<br>- Badge de notifications<br>- Liste des notifications récentes |
| US-039 | **En tant qu'utilisateur, je veux un mode sombre** pour travailler confortablement la nuit | BASSE | 2 | - Toggle dark/light mode<br>- Sauvegarde de la préférence<br>- Palette de couleurs adaptée |
| US-040 | **En tant qu'utilisateur, je veux pouvoir commenter les issues** pour discuter avec l'équipe | MOYENNE | 3 | - Zone de commentaires sur chaque issue<br>- Affichage chronologique<br>- Auteur et date<br>- Notification aux participants |

---

## Fonctionnalités Bonus (Si le temps le permet)

### Intégration Git (Optionnel)

| ID | User Story | Priorité | Points | Critères d'Acceptation |
|----|------------|----------|--------|------------------------|
| US-041 | **En tant qu'utilisateur, je veux lier un dépôt Git** pour suivre le code | BASSE | 8 | - Configuration du dépôt (URL, token)<br>- Liste des branches<br>- Liste des commits récents<br>- Lien commit → issue via message |
| US-042 | **En tant qu'utilisateur, je veux voir les commits d'une issue** pour suivre le développement | BASSE | 5 | - Liste des commits mentionnant l'issue<br>- Auteur, date, message<br>- Lien vers GitHub/GitLab |

### Autres Améliorations

| ID | User Story | Priorité | Points | Critères d'Acceptation |
|----|------------|----------|--------|------------------------|
| US-043 | **En tant qu'utilisateur, je veux créer des projets** pour organiser mes issues | BASSE | 5 | - Création de projets<br>- Association issues → projet<br>- Vue par projet<br>- Statistiques par projet |
| US-044 | **En tant qu'utilisateur, je veux définir des labels** pour catégoriser les issues | BASSE | 3 | - Création de labels personnalisés<br>- Couleur et nom<br>- Assignation multiple à une issue<br>- Filtre par label |
| US-045 | **En tant qu'utilisateur, je veux une vue Kanban** pour visualiser le workflow | BASSE | 5 | - Colonnes : Todo, In Progress, Done<br>- Drag & drop des cartes<br>- Mise à jour automatique du statut<br>- Filtres |

---

## Résumé des Points par Sprint

| Sprint | Nombre de US | Points Totaux | Priorité Critique/Haute |
|--------|--------------|---------------|-------------------------|
| **Sprint 1** | 17 | 50 points | 11 US |
| **Sprint 2** | 11 | 35 points | 7 US |
| **Sprint 3** | 12 | 38 points | 5 US |
| **Bonus** | 5 | 26 points | 0 US |
| **TOTAL** | 45 US | 149 points | 23 US critiques |

---

## Critères de Priorisation

Les user stories ont été priorisées selon les critères suivants :

1. **Dépendances techniques** : Les fonctionnalités de base avant les avancées
2. **Valeur métier** : Ce qui apporte le plus de valeur aux utilisateurs
3. **Risques** : Les parties complexes tôt pour dérisquer
4. **Incrémentalité** : Livrer une application fonctionnelle à chaque sprint

---

## Notes

- Ce backlog est évolutif et sera mis à jour à chaque sprint
- Les estimations seront affinées au fur et à mesure du projet
- Les user stories bonus ne seront développées que si le temps le permet
- La vélocité réelle sera mesurée après le Sprint 1

---

**Dernière révision :** Octobre 2025  
**Prochaine révision :** Fin Sprint 1 