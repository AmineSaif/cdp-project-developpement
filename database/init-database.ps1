Param(
  [string]$DbUser = "postgres",
  [string]$DbPassword = "postgres",
  [string]$DbName = "saas_dev",
  [string]$NewUser = "saas_user",
  [string]$NewPassword = "saas_password",
  [string]$Host = "localhost",
  [int]$Port = 5432
)

Write-Host "== Initialisation base de données ==" -ForegroundColor Cyan

$env:PGPASSWORD = $DbPassword

Write-Host "Création base ($DbName) et utilisateur ($NewUser) si nécessaires..."
psql -h $Host -U $DbUser -p $Port -c "CREATE USER $NewUser WITH PASSWORD '$NewPassword';" 2>$null
psql -h $Host -U $DbUser -p $Port -c "CREATE DATABASE $DbName;" 2>$null
psql -h $Host -U $DbUser -p $Port -c "ALTER DATABASE $DbName OWNER TO $NewUser;" 2>$null

Write-Host "Application schéma..."
psql -h $Host -U $NewUser -d $DbName -p $Port -f "$(Resolve-Path ./database/schema.sql)" || exit 1

Write-Host "Insertion seed (optionnel)..."
psql -h $Host -U $NewUser -d $DbName -p $Port -f "$(Resolve-Path ./database/seed.sql)" 2>$null

Write-Host "Terminé." -ForegroundColor Green
