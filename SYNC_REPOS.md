# Sincronización Automática de Repositorios

## 📋 Configuración Actual

Tu proyecto está configurado para mantener sincronizados **dos repositorios**:

1. **`origin`** → `v0-crm-web-app` (conectado a Vercel para deployment automático)
2. **`original`** → `MyworkIn-Perfil-Empresa-Universidades` (repositorio GitHub original)

## 🚀 Formas de Hacer Push

### Opción 1: Script NPM (Recomendado)
```bash
npm run push:all
```

Este comando hace push automáticamente a ambos repositorios.

### Opción 2: Manual
```bash
# Push a Vercel (despliegue automático)
git push origin main

# Push a GitHub original
git push original main
```

### Opción 3: Script PowerShell Directo
```powershell
.\scripts\push-all.ps1
```

## ⚙️ Hook de Git (Automático)

Se ha configurado un hook de Git que intenta hacer push automático después de cada commit. Sin embargo, esto puede fallar si no tienes credenciales configuradas o si hay problemas de red.

**Nota:** El hook automático puede no funcionar en todos los casos. Se recomienda usar `npm run push:all` después de cada commit importante.

## 🔍 Verificar Remotos

Para ver qué repositorios están configurados:
```bash
git remote -v
```

Deberías ver:
```
origin    https://github.com/diegorf2607/v0-crm-web-app.git (fetch)
origin    https://github.com/diegorf2607/v0-crm-web-app.git (push)
original  https://github.com/diegorf2607/MyworkIn-Perfil-Empresa-Universidades.git (fetch)
original  https://github.com/diegorf2607/MyworkIn-Perfil-Empresa-Universidades.git (push)
```

## 📝 Flujo de Trabajo Recomendado

1. Hacer cambios en tu código
2. Hacer commit:
   ```bash
   git add .
   git commit -m "tu mensaje de commit"
   ```
3. Hacer push a ambos repositorios:
   ```bash
   npm run push:all
   ```

Esto asegura que:
- ✅ Vercel reciba los cambios y haga deployment automático
- ✅ Tu repositorio GitHub original también esté actualizado

## 🐛 Solución de Problemas

### Si el push falla en uno de los repositorios:
El script continuará con el otro repositorio. Revisa los mensajes de error y vuelve a intentar el push manualmente al repositorio que falló.

### Si quieres desactivar el hook automático:
```bash
# Renombrar el hook (desactivarlo)
mv .git/hooks/post-commit .git/hooks/post-commit.disabled
```

### Si quieres reactivar el hook:
```bash
# Renombrar de vuelta
mv .git/hooks/post-commit.disabled .git/hooks/post-commit
```
