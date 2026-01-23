# Variables de Entorno para Vercel

## 📋 Variables que DEBES agregar en Vercel

Copia estos valores exactos en tu proyecto de Vercel (Settings → Environment Variables):

### 1. NEXT_PUBLIC_SUPABASE_URL
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://bgkdkrckiqybwmnhntvm.supabase.co
Environment: All Environments
```

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJna2RrcmNraXF5YndtbmhudHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MzI0NzIsImV4cCI6MjA4MTQwODQ3Mn0._GdstLE6o3Nfrtkg_omkQO4FF9sz-wwh-wtDNpmzmq8
Environment: All Environments
```

### 3. SUPABASE_URL
```
Key: SUPABASE_URL
Value: https://bgkdkrckiqybwmnhntvm.supabase.co
Environment: All Environments
```

## ✅ Variables que ya tienes (correctas)
- SUPABASE_SERVICE_ROLE_KEY ✅
- SUPABASE_ANON_KEY ✅ (aunque también necesitas NEXT_PUBLIC_SUPABASE_ANON_KEY)

## 🗑️ Variables que puedes eliminar (no se usan)
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (no se usa en el código)
- SUPABASE_SECRET_KEY (no se usa en el código)
- POSTGRES_* (no se usan directamente en Next.js)

## 📝 Instrucciones paso a paso

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto: `v0-crm-web-app`
3. Ve a: Settings → Environment Variables
4. Agrega las 3 variables de arriba
5. Guarda los cambios
6. Haz un nuevo deployment o espera al siguiente push
