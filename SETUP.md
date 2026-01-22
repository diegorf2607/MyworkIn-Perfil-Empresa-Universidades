# Configuración del Proyecto CRM MyWorkIn

## 📋 Resumen del Proyecto

Este es un proyecto **CRM (Customer Relationship Management)** llamado **MyWorkIn**, construido con:
- **Next.js 15.2.6** (React 19)
- **TypeScript**
- **Supabase** (Backend como servicio)
- **Tailwind CSS 4**
- **shadcn/ui** (Componentes UI)

## 🔧 Configuración Actual

### ✅ Completado

1. **Estructura del Proyecto**
   - ✅ Proyecto Next.js inicializado
   - ✅ TypeScript configurado
   - ✅ Tailwind CSS configurado
   - ✅ shadcn/ui configurado

2. **Supabase**
   - ✅ Cliente de Supabase para el navegador (`lib/supabase/client.ts`)
   - ✅ Cliente de Supabase para el servidor (`lib/supabase/server.ts`)
   - ✅ Script de setup de admin (`scripts/setup-admin.ts`)
   - ✅ Script de verificación de conexión (`scripts/verify-connection.ts`)
   - ✅ Variables de entorno configuradas parcialmente

3. **Git**
   - ✅ Repositorio Git inicializado
   - ✅ Commit inicial realizado
   - ⚠️ Remoto de GitHub pendiente de configurar

## 🔑 Variables de Entorno

### Variables Requeridas

El proyecto necesita las siguientes variables en el archivo `.env.local`:

```env
# URL pública de Supabase (para cliente y servidor)
NEXT_PUBLIC_SUPABASE_URL=https://bgkdkrckiqybwmnhntvm.supabase.co

# Clave anónima pública (para autenticación en el cliente)
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# URL de Supabase (para scripts del servidor)
SUPABASE_URL=https://bgkdkrckiqybwmnhntvm.supabase.co

# Clave de servicio (SOLO para scripts del servidor)
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

### ⚠️ Acción Requerida

**Falta agregar `NEXT_PUBLIC_SUPABASE_ANON_KEY` al archivo `.env.local`**

Para obtener la ANON_KEY:
1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Settings** → **API**
3. Copia la **anon/public** key
4. Agrégala a tu `.env.local` como `NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key-aqui`

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linter
npm run lint

# Verificar conexión con Supabase
npm run verify

# Crear usuario admin
npm run setup-admin
```

## 🔗 Conexión con GitHub

### Estado Actual
- ✅ Repositorio Git inicializado
- ✅ Commit inicial realizado
- ⚠️ **Remoto de GitHub NO configurado**

### Para conectar con GitHub:

1. **Crear un repositorio en GitHub** (si aún no existe)
2. **Agregar el remoto:**
   ```bash
   git remote add origin https://github.com/tu-usuario/v0-crm-myworkin.git
   ```
3. **Hacer push:**
   ```bash
   git branch -M main
   git push -u origin main
   ```

## 🗄️ Estructura de Base de Datos

El proyecto espera una tabla `team_members` en Supabase con la siguiente estructura:

```sql
team_members (
  id: uuid (primary key)
  user_id: uuid (foreign key a auth.users)
  name: text
  email: text
  role: text (ej: 'admin', 'member')
  is_active: boolean
  created_at: timestamp
  updated_at: timestamp
)
```

## ✅ Verificación de Conexiones

Para verificar que todo está conectado correctamente:

```bash
npm run verify
```

Este script verifica:
- ✅ Todas las variables de entorno están presentes
- ✅ Conexión con Supabase usando Service Role Key
- ✅ Conexión con Supabase usando Anon Key

## 📝 Próximos Pasos

1. ⚠️ Agregar `NEXT_PUBLIC_SUPABASE_ANON_KEY` al `.env.local`
2. ⚠️ Configurar remoto de GitHub
3. ⚠️ Ejecutar `npm run verify` para confirmar conexiones
4. ⚠️ Ejecutar `npm run setup-admin` para crear el usuario admin inicial

## 🔒 Seguridad

- ⚠️ **NUNCA** commitees el archivo `.env.local` (está en `.gitignore`)
- ✅ El archivo `env.example` está disponible como plantilla
- ⚠️ La `SUPABASE_SERVICE_ROLE_KEY` solo debe usarse en scripts del servidor
- ✅ La `NEXT_PUBLIC_SUPABASE_ANON_KEY` es segura para usar en el cliente
