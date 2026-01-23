# Script para configurar variables de entorno en Vercel
# Requiere: vercel CLI instalado (npm i -g vercel)

Write-Host "🔧 Configurando variables de entorno en Vercel..." -ForegroundColor Cyan
Write-Host ""

# Leer valores del .env.local
$envFile = ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ Archivo .env.local no encontrado" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content $envFile -Raw

# Extraer valores
$supabaseUrl = ($envContent | Select-String -Pattern "NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)").Matches.Groups[1].Value
$anonKey = ($envContent | Select-String -Pattern "NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\r\n]+)").Matches.Groups[1].Value
$supabaseUrlServer = ($envContent | Select-String -Pattern "SUPABASE_URL=([^\r\n]+)").Matches.Groups[1].Value

if (-not $supabaseUrl -or -not $anonKey -or -not $supabaseUrlServer) {
    Write-Host "❌ No se pudieron extraer todos los valores necesarios del .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Valores extraídos del .env.local" -ForegroundColor Green
Write-Host ""

# Verificar si vercel CLI está instalado
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "⚠️  Vercel CLI no está instalado" -ForegroundColor Yellow
    Write-Host "Instalando Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host ""
Write-Host "📋 Variables a agregar:" -ForegroundColor Cyan
Write-Host "  1. NEXT_PUBLIC_SUPABASE_URL = $supabaseUrl" -ForegroundColor White
Write-Host "  2. NEXT_PUBLIC_SUPABASE_ANON_KEY = $($anonKey.Substring(0, 20))..." -ForegroundColor White
Write-Host "  3. SUPABASE_URL = $supabaseUrlServer" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  IMPORTANTE: Este script requiere que estés autenticado en Vercel" -ForegroundColor Yellow
Write-Host "   Si no lo estás, ejecuta: vercel login" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "¿Continuar? (S/N)"
if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "❌ Cancelado" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 Agregando variables de entorno..." -ForegroundColor Cyan

# Agregar variables usando vercel env add
Write-Host "Agregando NEXT_PUBLIC_SUPABASE_URL..." -ForegroundColor Yellow
$result1 = vercel env add NEXT_PUBLIC_SUPABASE_URL production 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Error o variable ya existe. Continuando..." -ForegroundColor Yellow
}

Write-Host "Agregando NEXT_PUBLIC_SUPABASE_ANON_KEY..." -ForegroundColor Yellow
$result2 = vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Error o variable ya existe. Continuando..." -ForegroundColor Yellow
}

Write-Host "Agregando SUPABASE_URL..." -ForegroundColor Yellow
$result3 = vercel env add SUPABASE_URL production 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Error o variable ya existe. Continuando..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Proceso completado" -ForegroundColor Green
Write-Host ""
Write-Host "📝 NOTA: Las variables deben agregarse manualmente en Vercel Dashboard" -ForegroundColor Yellow
Write-Host "   porque la CLI requiere interacción para ingresar los valores." -ForegroundColor Yellow
Write-Host ""
Write-Host "   Ve a: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "   Proyecto → Settings → Environment Variables" -ForegroundColor Cyan
Write-Host ""
