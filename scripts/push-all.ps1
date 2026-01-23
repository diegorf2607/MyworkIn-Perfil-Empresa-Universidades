# Script PowerShell para hacer push a todos los repositorios remotos

Write-Host "Haciendo push a todos los repositorios..." -ForegroundColor Cyan

# Push a Vercel (origin)
Write-Host "Push a Vercel (v0-crm-web-app)..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Push a Vercel completado" -ForegroundColor Green
} else {
    Write-Host "Error en push a Vercel" -ForegroundColor Red
    exit $LASTEXITCODE
}

# Push a GitHub original
Write-Host "Push a GitHub original (MyworkIn-Perfil-Empresa-Universidades)..." -ForegroundColor Yellow
git push original main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Push a GitHub original completado" -ForegroundColor Green
} else {
    Write-Host "Error en push a GitHub original" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Push completado a todos los repositorios" -ForegroundColor Green
