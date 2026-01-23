#!/bin/bash
# Script para hacer push a todos los repositorios remotos

echo "🚀 Haciendo push a todos los repositorios..."

# Push a Vercel (origin)
echo "📤 Push a Vercel (v0-crm-web-app)..."
git push origin main

# Push a GitHub original
echo "📤 Push a GitHub original (MyworkIn-Perfil-Empresa-Universidades)..."
git push original main

echo "✅ Push completado a todos los repositorios"
