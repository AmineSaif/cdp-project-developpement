# Script de Push en 4 parties
# MAINTENANT: 2 pushs (Monir + Adnane)
# DANS 20 MIN: 2 pushs (Monir + Adnane)

Write-Host "=== Script de Push en 4 Parties ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "MAINTENANT:" -ForegroundColor Magenta
Write-Host "  Push 1 (MONIR) : Backend Core" -ForegroundColor Green
Write-Host "  Push 2 (ADNANE) : Backend Notifications & Stats" -ForegroundColor Yellow
Write-Host ""
Write-Host "DANS 20 MINUTES:" -ForegroundColor Magenta
Write-Host "  Push 3 (MONIR) : Frontend Core" -ForegroundColor Green
Write-Host "  Push 4 (ADNANE) : Frontend Stats & Notifications" -ForegroundColor Yellow
Write-Host ""

# Vérifier qu'on est sur la branche main
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-Host "Passage sur la branche main..." -ForegroundColor Cyan
    git checkout main
}

# Récupérer les derniers changements
Write-Host "`nRecuperation des derniers changements..." -ForegroundColor Cyan
git pull origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nATTENTION: Conflits detectes ou changements locaux non commites!" -ForegroundColor Red
    Write-Host "Le script va continuer avec vos changements locaux." -ForegroundColor Yellow
    Write-Host ""
}

# ============================================
# PUSH 1 - MONIR : Backend Core
# ============================================
Write-Host "`n============================================" -ForegroundColor Magenta
Write-Host "PUSH 1 - MONIR" -ForegroundColor Magenta
Write-Host "Backend: Projets, Clients, Sprints" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta

Write-Host "`nAjout des fichiers Backend Core..." -ForegroundColor Yellow

git add backend/src/models/client.js
git add backend/src/models/project.js
git add backend/src/models/projectMember.js
git add backend/src/models/sprint.js
git add backend/src/utils/projectCodeGenerator.js
git add backend/src/routes/clients.js
git add backend/src/routes/projects.js
git add backend/src/routes/sprints.js
git add backend/src/controllers/clientController.js
git add backend/src/controllers/projectController.js
git add backend/src/controllers/sprintController.js
git add database/migration-project-hierarchy.sql

Write-Host "`nFichiers ajoutés au staging:" -ForegroundColor Green
git status --short

$confirm1 = Read-Host "`nConfirmer le commit et push? (o/n)"
if ($confirm1 -eq "o") {
    git commit -m 'feat: Backend - Systeme de projets et sprints' -m 'Modeles: Client, Project, ProjectMember, Sprint' -m 'Routes CRUD pour clients, projets, sprints' -m 'Co-authored-by: Ameziane Adnane <adnaneamezianefr@gmail.com>'
    
    git push origin main
    Write-Host "`nPush 1 reussi!" -ForegroundColor Green
} else {
    Write-Host "Push 1 annule" -ForegroundColor Red
    exit
}

# ============================================
# PUSH 2 - ADNANE : Backend Notifications & Stats
# ============================================
Write-Host "`n============================================" -ForegroundColor Magenta
Write-Host "PUSH 2 - ADNANE AMEZIANE" -ForegroundColor Magenta
Write-Host "Backend: Notifications et Statistiques" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta

Write-Host "`nAjout des fichiers Backend Notifications..." -ForegroundColor Yellow

git add backend/src/models/notification.js
git add backend/src/controllers/statsController.js
git add backend/src/routes/notifications.js
git add backend/src/utils/notificationHelper.js

Write-Host "`nFichiers ajoutés au staging:" -ForegroundColor Green
git status --short

$confirm2 = Read-Host "`nConfirmer le commit et push? (o/n)"
if ($confirm2 -eq "o") {
    git commit --author='Ameziane Adnane <adnaneamezianefr@gmail.com>' -m 'feat: Backend - Notifications et Statistiques' -m 'Systeme de notifications en temps reel' -m 'Controller de statistiques de projet' -m 'Co-authored-by: Monir <mconr@example.com>'
    
    git push origin main
    Write-Host "`nPush 2 reussi!" -ForegroundColor Green
} else {
    Write-Host "Push 2 annule" -ForegroundColor Red
    exit
}

# ============================================
# ATTENTE DE 20 MINUTES
# ============================================
Write-Host "`n`n============================================" -ForegroundColor Cyan
Write-Host "⏰ PAUSE DE 20 MINUTES" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Les 2 premiers pushs sont terminés!" -ForegroundColor Green
Write-Host ""
Write-Host "Options:" -ForegroundColor Yellow
Write-Host "  1. Attendre 20 minutes automatiquement" -ForegroundColor Gray
Write-Host "  2. Continuer maintenant" -ForegroundColor Gray
Write-Host "  3. Arrêter (vous relancerez manuellement)" -ForegroundColor Gray
Write-Host ""

$waitChoice = Read-Host "Votre choix (1/2/3)"

if ($waitChoice -eq "1") {
    Write-Host "`nAttente de 20 minutes (1200 secondes)..." -ForegroundColor Yellow
    Write-Host "Vous pouvez annuler avec Ctrl+C" -ForegroundColor Gray
    Start-Sleep -Seconds 1200
    Write-Host "`n20 minutes ecoulees! On continue..." -ForegroundColor Green
} elseif ($waitChoice -eq "3") {
    Write-Host "`nScript arrete. Relancez avec: .\push-partie-2.ps1" -ForegroundColor Yellow
    exit
}

# ============================================
# PUSH 3 - MONIR : Frontend Core
# ============================================
Write-Host "`n============================================" -ForegroundColor Magenta
Write-Host "PUSH 3 - MONIR" -ForegroundColor Magenta
Write-Host "Frontend: Gestion de Projets" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta

Write-Host "`nRecuperation des derniers changements..." -ForegroundColor Yellow
git pull origin main

Write-Host "Ajout des fichiers Frontend Core..." -ForegroundColor Yellow

git add frontend/src/pages/Projects.jsx
git add frontend/src/pages/ProjectSettings.jsx
git add frontend/src/pages/ProjectMembers.jsx
git add frontend/src/components/CreateSprintModal.jsx
git add frontend/src/components/ProjectSidebar.jsx
git add frontend/src/context/ProjectContext.jsx
git add frontend/src/main.jsx

Write-Host "`nFichiers ajoutés au staging:" -ForegroundColor Green
git status --short

$confirm3 = Read-Host "`nConfirmer le commit et push? (o/n)"
if ($confirm3 -eq "o") {
    git commit -m 'feat: Frontend - Gestion de projets' -m 'Page de gestion des projets' -m 'Parametres de projet et membres' -m 'Co-authored-by: Ameziane Adnane <adnaneamezianefr@gmail.com>'
    
    git push origin main
    Write-Host "`nPush 3 reussi!" -ForegroundColor Green
} else {
    Write-Host "Push 3 annule" -ForegroundColor Red
    exit
}

# ============================================
# PUSH 4 - ADNANE : Frontend Stats & Notifications
# ============================================
Write-Host "`n============================================" -ForegroundColor Magenta
Write-Host "PUSH 4 - ADNANE AMEZIANE (FINAL)" -ForegroundColor Magenta
Write-Host "Frontend: Stats et Notifications" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta

Write-Host "`nAjout des fichiers Frontend Stats..." -ForegroundColor Yellow

git add frontend/src/pages/ProjectStats.jsx
git add frontend/src/pages/Notifications.jsx
git add frontend/src/components/NotificationBell.jsx
git add frontend/src/styles/notifications.css
git add frontend/src/index.css
git add frontend/package.json

Write-Host "`nFichiers ajoutés au staging:" -ForegroundColor Green
git status --short

$confirm4 = Read-Host "`nConfirmer le commit et push? (o/n)"
if ($confirm4 -eq "o") {
    git commit --author='Ameziane Adnane <adnaneamezianefr@gmail.com>' -m 'feat: Frontend - Dashboard Stats et Notifications' -m 'Dashboard de statistiques avec recharts' -m 'Systeme de notifications en temps reel' -m 'Co-authored-by: Monir <mconr@example.com>'
    
    git push origin main
    Write-Host "`nPush 4 reussi!" -ForegroundColor Green
    Write-Host "`nTOUS LES PUSHS SONT TERMINES!" -ForegroundColor Green
} else {
    Write-Host "Push 4 annule" -ForegroundColor Red
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Resume final:" -ForegroundColor Cyan
Write-Host "Push 1 (MONIR) : Backend Core" -ForegroundColor Green
Write-Host "Push 2 (ADNANE) : Backend Notifications et Stats" -ForegroundColor Green
Write-Host "Push 3 (MONIR) : Frontend Core" -ForegroundColor Green
Write-Host "Push 4 (ADNANE) : Frontend Stats et Notifications" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
