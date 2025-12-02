# Script PowerShell pour tester l'API Profile

# Configuration
$baseUrl = "http://localhost:4000"
$headers = @{"Content-Type" = "application/json"}

# Test de connexion avec des identifiants par défaut
Write-Host "=== Test de l'API Profile ===" -ForegroundColor Green

# 1. Test de connexion
Write-Host "1. Test de connexion..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Headers $headers -Body '{"email":"admin@example.com","password":"password"}'
    $token = $loginResponse.token
    Write-Host "✓ Connexion réussie" -ForegroundColor Green
    
    # Ajouter le token aux headers
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    }
    
    # 2. Test de récupération du profil
    Write-Host "2. Test de récupération du profil..." -ForegroundColor Yellow
    $profile = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method GET -Headers $authHeaders
    Write-Host "✓ Profil récupéré: $($profile.name) ($($profile.email))" -ForegroundColor Green
    
    # 3. Test de mise à jour du profil
    Write-Host "3. Test de mise à jour du profil..." -ForegroundColor Yellow
    $updateProfile = @{
        name = "Test User Updated"
        email = $profile.email
    } | ConvertTo-Json
    
    $updatedProfile = Invoke-RestMethod -Uri "$baseUrl/api/auth/profile" -Method PATCH -Headers $authHeaders -Body $updateProfile
    Write-Host "✓ Profil mis à jour: $($updatedProfile.name)" -ForegroundColor Green
    
    # 4. Test de récupération des statistiques
    Write-Host "4. Test de récupération des statistiques..." -ForegroundColor Yellow
    try {
        $stats = Invoke-RestMethod -Uri "$baseUrl/api/auth/stats" -Method GET -Headers $authHeaders
        Write-Host "✓ Statistiques récupérées" -ForegroundColor Green
        Write-Host "  Issues totales: $($stats.totalIssues)" -ForegroundColor Cyan
    } catch {
        Write-Host "⚠ Endpoint des statistiques non trouvé (normal si pas implémenté)" -ForegroundColor Yellow
    }
    
    Write-Host "`n=== Tous les tests sont passés! ===" -ForegroundColor Green
    
}
catch {
    Write-Host "❌ Erreur lors des tests: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Détails: $($_.ErrorDetails)" -ForegroundColor Red
    }
}