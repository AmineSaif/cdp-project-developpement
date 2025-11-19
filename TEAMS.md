# Fonctionnalité Équipes - Guide d'utilisation

## 🎯 Vue d'ensemble

Le système d'équipes permet de collaborer avec d'autres utilisateurs sur un espace partagé d'issues et de tâches.

## 🚀 Fonctionnalités

### 1. **Inscription avec Code d'Équipe**

Lors de l'inscription, deux options :

#### Option A : Créer une nouvelle équipe
- Laissez le champ "Code d'équipe" **vide**
- Un code unique à 8 caractères sera automatiquement généré
- Vous devenez le créateur de l'équipe
- **Exemple de code** : `A3F7B2C9`

#### Option B : Rejoindre une équipe existante
- Entrez le code d'équipe fourni par un collègue
- Vous rejoignez automatiquement cette équipe
- Accès immédiat aux issues partagées

### 2. **Code d'Équipe dans le Profil**

Accédez à **Mon Profil → Informations personnelles** :
- Visualisez votre code d'équipe
- Bouton **"Copier"** pour partager facilement
- Nom de l'équipe affiché

### 3. **Assignation aux Membres**

Lors de la création d'une issue :
- Liste déroulante **"Assigner à"**
- Affiche tous les membres de votre équipe
- Format : `Nom (email)`
- Option "Non assigné" disponible

### 4. **Filtrage des Issues**

#### Dans le Board (Kanban)
Bouton toggle en haut à droite :
- **👥 Toutes les issues** : Issues de toute l'équipe
- **✅ Mes issues** : Seulement celles assignées à vous

#### Dans la Liste des Issues
Même fonctionnalité de filtrage disponible

### 5. **Statistiques Intelligentes**

Dans **Mon Profil → Statistiques** :
- Toggle **"👥 Issues de l'équipe"** vs **"✅ Mes issues assignées"**
- Statistiques dynamiques selon le filtre choisi
- Graphiques par statut et type

## 🔧 Configuration Backend

### Migration Base de Données Existante

Si vous avez déjà une base `saas_dev` :

```bash
psql -U saas_user -d saas_dev -f database/migration-add-teams.sql
```

### Nouvelle Installation

Utilisez le schéma complet :

```bash
psql -U saas_user -d saas_dev -f database/schema.sql
```

### Synchronisation Sequelize

Le backend utilise `alter: true`, donc les tables seront mises à jour automatiquement au démarrage :

```bash
cd backend
npm run dev
```

## 📡 API Endpoints

### Équipes

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/teams/members` | Liste des membres de mon équipe |
| GET | `/api/teams/my-team` | Infos complètes de mon équipe |

### Authentification

| Méthode | Route | Body | Description |
|---------|-------|------|-------------|
| POST | `/api/auth/register` | `{ name, email, password, teamCode? }` | Inscription avec code optionnel |
| GET | `/api/auth/me` | - | Profil avec infos équipe |
| GET | `/api/auth/stats?myIssuesOnly=true` | - | Stats filtrées |

### Issues

| Méthode | Route | Query | Description |
|---------|-------|-------|-------------|
| GET | `/api/issues?myIssuesOnly=true` | `myIssuesOnly` | Issues filtrées |
| POST | `/api/issues` | `{ ..., assigneeId }` | Créer avec assignation |

## 🎨 Composants Frontend Modifiés

### Pages
- `Register.jsx` : Champ teamCode
- `Profile.jsx` : Affichage code d'équipe + toggle stats
- `Board.jsx` : Toggle filtre issues
- `IssuesList.jsx` : Toggle filtre issues

### Composants
- `CreateIssueModal.jsx` : Liste membres pour assignation

## 🧪 Scénarios de Test

### Test 1 : Création d'Équipe
1. S'inscrire **sans** code d'équipe
2. Vérifier réception du code dans la réponse
3. Aller dans Profil → voir le code généré

### Test 2 : Rejoindre une Équipe
1. Copier le code d'un utilisateur existant
2. S'inscrire avec ce code
3. Vérifier que les deux users voient les mêmes issues

### Test 3 : Assignation
1. Créer une issue
2. L'assigner à un membre
3. Vérifier filtre "Mes issues"

### Test 4 : Filtres
1. Créer plusieurs issues (certaines assignées)
2. Tester toggle Board/Liste
3. Vérifier stats avec/sans filtre

## ⚠️ Points d'Attention

### Utilisateurs Sans Équipe
- `teamId = NULL` en base
- Voient seulement leurs propres issues créées
- Peuvent créer une équipe à tout moment (feature future)

### Sécurité
- Codes d'équipe uniques (8 caractères hex)
- Vérification existence lors de l'inscription
- Pas de limite de membres par équipe (configurable)

### Performance
- Index ajoutés sur `team_id`, `team_code`
- Requêtes optimisées avec `include` Sequelize

## 🔮 Évolutions Futures

- [ ] Renommer une équipe
- [ ] Quitter une équipe
- [ ] Transférer propriété équipe
- [ ] Limite de membres
- [ ] Rôles dans l'équipe (admin/membre)
- [ ] Invitations par email

## 📝 Notes Développeur

### Structure Modèles

```javascript
Team {
  id, name, teamCode, createdById
}

User {
  id, name, email, teamId → Team
}

Issue {
  id, title, ..., teamId → Team, assigneeId → User
}
```

### Relations Sequelize

```javascript
Team.hasMany(User, { as: 'members' })
Team.hasMany(Issue, { as: 'issues' })
User.belongsTo(Team, { as: 'team' })
Issue.belongsTo(Team, { as: 'team' })
```

---

**Documentation mise à jour** : 19 novembre 2025
