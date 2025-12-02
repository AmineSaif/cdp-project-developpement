# Script de Push vers GitHub - Branche develop

# 1. Vérifier l'état actuel
Write-Host "=== Vérification de l'état Git ===" -ForegroundColor Cyan
git status

# 2. Vérifier si le remote existe déjà
Write-Host "`n=== Vérification du remote ===" -ForegroundColor Cyan
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "Remote actuel: $remoteExists" -ForegroundColor Yellow
    $response = Read-Host "Voulez-vous changer le remote? (o/n)"
    if ($response -eq "o") {
        git remote remove origin
        git remote add origin https://github.com/AmineSaif/cdp-project-developpement.git
        Write-Host "Remote mis à jour!" -ForegroundColor Green
    }
} else {
    git remote add origin https://github.com/AmineSaif/cdp-project-developpement.git
    Write-Host "Remote ajouté!" -ForegroundColor Green
}

# 3. Passer sur la branche develop (ou la créer)
Write-Host "`n=== Basculement sur develop ===" -ForegroundColor Cyan
git checkout develop 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Branche develop n'existe pas localement, création..." -ForegroundColor Yellow
    git checkout -b develop
}

# 4. OPTION 1: Commit Backend (Équipes)
Write-Host "`n=== OPTION 1: Commit Backend ===" -ForegroundColor Magenta
$backendCommit = Read-Host "Voulez-vous faire le commit Backend/Équipes? (o/n)"
if ($backendCommit -eq "o") {
    Write-Host "Ajout des fichiers backend..." -ForegroundColor Yellow
    git add database/
    git add backend/src/models/
    git add backend/src/utils/teamCodeGenerator.js
    git add backend/src/controllers/authController.js
    git add backend/src/controllers/issueController.js
    git add backend/src/controllers/teamController.js
    git add backend/src/routes/teams.js
    git add backend/src/routes/issues.js
    git add backend/src/index.js
    git add backend/src/middlewares/auth.js
    git add TEAMS.md
    git add README.md
    
    Write-Host "Fichiers ajoutés!" -ForegroundColor Green
    git status
    
    $confirmCommit = Read-Host "`nConfirmer le commit? (o/n)"
    if ($confirmCommit -eq "o") {
        git commit -m "feat: Système d'équipes avec isolation complète des boards

- Ajout table teams avec codes d'invitation uniques (8 caractères hex)
- Inscription avec/sans code d'équipe  
- Isolation des issues par teamId
- Sécurité: vérification teamId sur toutes les opérations CRUD
- Middleware auth obligatoire sur routes /api/issues
- Endpoints /api/teams pour gestion d'équipe
- Migration SQL pour bases existantes
- Documentation complète dans TEAMS.md

Chaque équipe a maintenant son propre dashboard isolé.
Les utilisateurs d'équipes différentes ne peuvent pas voir/modifier
les issues des autres équipes."
        
        Write-Host "`nCommit créé!" -ForegroundColor Green
        
        $pushBackend = Read-Host "Pusher vers GitHub? (o/n)"
        if ($pushBackend -eq "o") {
            git push -u origin develop
            Write-Host "Push réussi!" -ForegroundColor Green
        }
    }
}

# 5. OPTION 2: Commit Frontend (UI/UX)
Write-Host "`n=== OPTION 2: Commit Frontend ===" -ForegroundColor Magenta
$frontendCommit = Read-Host "Voulez-vous faire le commit Frontend/UI? (o/n)"
if ($frontendCommit -eq "o") {
    Write-Host "Ajout des fichiers frontend..." -ForegroundColor Yellow
    git add frontend/src/pages/
    git add frontend/src/components/
    git add frontend/src/context/AuthContext.jsx
    git add frontend/src/index.css
    
    Write-Host "Fichiers ajoutés!" -ForegroundColor Green
    git status
    
    $confirmCommit = Read-Host "`nConfirmer le commit? (o/n)"
    if ($confirmCommit -eq "o") {
        git commit -m "feat: Améliorations UI/UX et gestion d'équipe

Frontend:
- Affichage username + icône dans navbar
- Barres de priorité colorées sur cartes Kanban (gradient selon priority)
- Formulaire inscription: champ teamCode optionnel
- Page Profile: affichage code d'équipe avec bouton copier
- Toggle 'Mes issues' / 'Toutes les issues de l'équipe'
- Assignation d'issues aux membres d'équipe
- Modal détails: affichage et modification de l'assignee

Correctifs:
- AuthContext: remplacement require() par import (ES6)
- CSS: .user-meta visible avec flex layout
- Inputs: alignement et overflow fixes

UX améliorée pour la collaboration en équipe."
        
        Write-Host "`nCommit créé!" -ForegroundColor Green
        
        $pushFrontend = Read-Host "Pusher vers GitHub? (o/n)"
        if ($pushFrontend -eq "o") {
            git push origin develop
            Write-Host "Push réussi!" -ForegroundColor Green
        }
    }
}

# 6. OPTION 3: Tout en un seul commit
Write-Host "`n=== OPTION 3: Commit Tout-en-un ===" -ForegroundColor Magenta
$allCommit = Read-Host "Voulez-vous tout commiter en une fois? (o/n)"
if ($allCommit -eq "o") {
    Write-Host "Ajout de tous les fichiers..." -ForegroundColor Yellow
    git add database/
    git add backend/src/
    git add frontend/src/
    git add TEAMS.md
    git add README.md
    git add COMMIT_GUIDE.md
    
    Write-Host "Fichiers ajoutés!" -ForegroundColor Green
    git status
    
    $confirmCommit = Read-Host "`nConfirmer le commit? (o/n)"
    if ($confirmCommit -eq "o") {
        git commit -m "feat: Système d'équipes complet avec UI/UX améliorée

Backend:
- Tables teams, isolation par teamId
- Codes d'invitation uniques (8 caractères hex)
- Sécurité et middleware auth sur toutes routes
- Endpoints /api/teams pour gestion
- Migration SQL incluse

Frontend:
- Username + icône dans navbar
- Barres priorité colorées Kanban
- Assignation membres d'équipe
- Toggle mes issues/toutes issues
- Profile avec code équipe et copie
- Correctifs AuthContext (import ES6) et CSS

Chaque équipe a son dashboard isolé."
        
        Write-Host "`nCommit créé!" -ForegroundColor Green
        
        $pushAll = Read-Host "Pusher vers GitHub? (o/n)"
        if ($pushAll -eq "o") {
            git push -u origin develop
            Write-Host "Push réussi!" -ForegroundColor Green
        }
    }
}

Write-Host "`n=== Terminé! ===" -ForegroundColor Cyan
Write-Host "Votre code est maintenant sur GitHub dans la branche develop!" -ForegroundColor Green
