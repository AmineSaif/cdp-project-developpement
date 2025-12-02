# Script PowerShell pour tester l'API Profile
$baseUrl = "http://localhost:4000"
$headers = @{"Content-Type" = "application/json"}

Write-Host "=== Test de l'API Profile ===" -ForegroundColor Green

try {
    # 1. Test de connexion
    Write-Host "1. Test de connexion..." -ForegroundColor Yellow
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Headers $headers -Body '{"email":"admin@example.com","password":"password"}'
    $token = $loginResponse.token
    Write-Host "   Connexion reussie" -ForegroundColor Green
    
    # Headers avec token
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    }
    
    # 2. Test de récupération du profil
    Write-Host "2. Test de recuperation du profil..." -ForegroundColor Yellow
    $profile = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method GET -Headers $authHeaders
    Write-Host "   Profil recupere: $($profile.name) ($($profile.email))" -ForegroundColor Green
    
    Write-Host "=== Tests termines avec succes! ===" -ForegroundColor Green
}
catch {
    Write-Host "Erreur lors des tests: $($_.Exception.Message)" -ForegroundColor Red
}