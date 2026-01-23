# 🔧 Configuración de Variables de Entorno en Vercel

## ⚡ Método Rápido (Manual - Recomendado)

### Paso 1: Ve a Vercel Dashboard
1. Abre: https://vercel.com/dashboard
2. Selecciona tu proyecto: **`v0-crm-web-app`**
3. Ve a: **Settings** → **Environment Variables**

### Paso 2: Agrega estas 3 variables

#### Variable 1: NEXT_PUBLIC_SUPABASE_URL
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://bgkdkrckiqybwmnhntvm.supabase.co
Environment: ✅ Production ✅ Preview ✅ Development
```

#### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJna2RrcmNraXF5YndtbmhudHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MzI0NzIsImV4cCI6MjA4MTQwODQ3Mn0._GdstLE6o3Nfrtkg_omkQO4FF9sz-wwh-wtDNpmzmq8
Environment: ✅ Production ✅ Preview ✅ Development
```

#### Variable 3: SUPABASE_URL
```
Key: SUPABASE_URL
Value: https://bgkdkrckiqybwmnhntvm.supabase.co
Environment: ✅ Production ✅ Preview ✅ Development
```

### Paso 3: Guardar y Redeploy
1. Haz clic en **"Save"** después de agregar cada variable
2. Ve a **Deployments**
3. Haz clic en el deployment más reciente
4. Haz clic en **"Redeploy"** para aplicar las nuevas variables

---

## 🤖 Método Automático (CLI de Vercel)

Si prefieres usar la línea de comandos:

### Paso 1: Instalar Vercel CLI
```bash
npm install -g vercel
```

### Paso 2: Autenticarse
```bash
vercel login
```

### Paso 3: Agregar variables
```bash
# Variable 1
echo "https://bgkdkrckiqybwmnhntvm.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production

# Variable 2
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJna2RrcmNraXF5YndtbmhudHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MzI0NzIsImV4cCI6MjA4MTQwODQ3Mn0._GdstLE6o3Nfrtkg_omkQO4FF9sz-wwh-wtDNpmzmq8" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Variable 3
echo "https://bgkdkrckiqybwmnhntvm.supabase.co" | vercel env add SUPABASE_URL production
```

### Paso 4: Aplicar a todos los ambientes
Repite los comandos cambiando `production` por:
- `preview`
- `development`

---

## ✅ Verificación

Después de agregar las variables:

1. **Verifica en Vercel Dashboard:**
   - Settings → Environment Variables
   - Deben aparecer las 3 variables nuevas

2. **Haz un nuevo deployment:**
   - Puedes hacer un push o redeploy manual
   - El deployment debería usar las nuevas variables

3. **Verifica que la app funcione:**
   - Ve a tu URL de producción
   - Intenta hacer login con: `admin@myworkkin.pe` / `admin123`

---

## 📋 Resumen de Variables Necesarias

### ✅ Variables que DEBES tener:
- `NEXT_PUBLIC_SUPABASE_URL` ⚠️ **FALTA**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ⚠️ **FALTA**
- `SUPABASE_URL` ⚠️ **FALTA**
- `SUPABASE_SERVICE_ROLE_KEY` ✅ Ya la tienes

### ✅ Variables que ya tienes (correctas):
- `SUPABASE_ANON_KEY` ✅ (aunque también necesitas la versión NEXT_PUBLIC_)

### 🗑️ Variables que NO necesitas:
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (no se usa)
- `SUPABASE_SECRET_KEY` (no se usa)
- `POSTGRES_*` (no se usan directamente)

---

## 🚨 Importante

**Las variables con prefijo `NEXT_PUBLIC_` son visibles en el cliente (navegador).**
- Son seguras para exponer (son las claves públicas/anónimas)
- Son necesarias para que la autenticación funcione en el navegador

**Las variables SIN prefijo `NEXT_PUBLIC_` son solo del servidor.**
- `SUPABASE_SERVICE_ROLE_KEY` debe mantenerse secreta
- Solo se usa en scripts del servidor
