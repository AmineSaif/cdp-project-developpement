# Script pour créer un utilisateur et tester l'API Profile
$baseUrl = "http://localhost:4000"
$headers = @{"Content-Type" = "application/json"}

Write-Host "=== Test complet de l'API Profile ===" -ForegroundColor Green

try {
    # 1. Créer un utilisateur de test
    Write-Host "1. Creation d'un utilisateur de test..." -ForegroundColor Yellow
    $newUser = @{
        name = "Test User"
        email = "test@example.com"
        password = "password123"
        role = "user"
    } | ConvertTo-Json
    
    try {
        $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Headers $headers -Body $newUser
        Write-Host "   Utilisateur cree avec succes" -ForegroundColor Green
        $token = $registerResponse.token
    } catch {
        # Si l'utilisateur existe déjà, essayons de nous connecter
        Write-Host "   Utilisateur existe deja, connexion..." -ForegroundColor Yellow
        $loginData = @{
            email = "test@example.com"
            password = "password123"
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Headers $headers -Body $loginData
        $token = $loginResponse.token
        Write-Host "   Connexion reussie" -ForegroundColor Green
    }
    
    # Headers avec token
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    }
    
    # 2. Test de récupération du profil
    Write-Host "2. Test de recuperation du profil..." -ForegroundColor Yellow
    $profile = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method GET -Headers $authHeaders
    Write-Host "   Profil recupere: $($profile.name) ($($profile.email))" -ForegroundColor Green
    
    # 3. Test de mise à jour du profil
    Write-Host "3. Test de mise a jour du profil..." -ForegroundColor Yellow
    $updateData = @{
        name = "Test User Updated"
        email = $profile.email
    } | ConvertTo-Json
    
    $updatedProfile = Invoke-RestMethod -Uri "$baseUrl/api/auth/profile" -Method PATCH -Headers $authHeaders -Body $updateData
    Write-Host "   Profil mis a jour: $($updatedProfile.name)" -ForegroundColor Green
    
    # 4. Test de changement de mot de passe
    Write-Host "4. Test de changement de mot de passe..." -ForegroundColor Yellow
    $passwordData = @{
        currentPassword = "password123"
        newPassword = "newpassword123"
    } | ConvertTo-Json
    
    try {
        $passwordResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/password" -Method PATCH -Headers $authHeaders -Body $passwordData
        Write-Host "   Mot de passe change avec succes" -ForegroundColor Green
    } catch {
        Write-Host "   Erreur changement mot de passe: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    Write-Host "`n=== Tous les tests sont termines! ===" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur lors des tests: $($_.Exception.Message)" -ForegroundColor Red
}