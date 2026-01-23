# 🔍 Diagnóstico de Errores - MyWorkIn CRM

## Problemas Comunes y Soluciones

### ❌ Error 1: "Las variables están creadas pero no funcionan"

**Síntomas:**
- Las variables aparecen en Vercel
- El login no funciona
- Errores en la consola del navegador

**Causas posibles:**
1. **Valores incorrectos en las variables**
   - Verifica que `NEXT_PUBLIC_SUPABASE_URL` sea: `https://bgkdkrckiqybwmnhntvm.supabase.co`
   - Verifica que `NEXT_PUBLIC_SUPABASE_ANON_KEY` sea la clave anónima correcta

2. **Variables no aplicadas al deployment**
   - Si agregaste las variables después del último deployment, necesitas hacer redeploy
   - Las variables solo se aplican en nuevos deployments

3. **Variables en ambiente incorrecto**
   - Verifica que las variables estén en "All Environments" o al menos en "Production"

**Solución:**
```bash
# 1. Ejecuta el diagnóstico
npm run diagnose

# 2. Verifica los valores en Vercel Dashboard
# Settings → Environment Variables

# 3. Haz un redeploy
# Deployments → Último deployment → Redeploy
```

---

### ❌ Error 2: "Usuario admin no existe"

**Síntomas:**
- Error al intentar hacer login
- Mensaje: "Invalid login credentials"

**Solución:**
```bash
# Crear usuario admin
npm run setup-admin
```

**Credenciales:**
- Email: `admin@myworkkin.pe`
- Password: `admin123`

---

### ❌ Error 3: "Deployments no aparecen en Vercel"

**Síntomas:**
- Haces push pero no aparece nuevo deployment
- Los deployments están desactualizados

**Causas:**
1. **Webhook de GitHub no funciona**
   - Verifica en GitHub: Settings → Webhooks
   - Debe haber un webhook de Vercel activo

2. **Repositorio incorrecto conectado**
   - Verifica en Vercel: Settings → Git
   - Debe estar conectado a: `diegorf2607/v0-crm-web-app`

3. **Rama incorrecta**
   - Verifica que estés haciendo push a `main`
   - Verifica que Vercel esté configurado para `main`

**Solución:**
```bash
# Verificar remoto
git remote -v

# Debe mostrar:
# origin  https://github.com/diegorf2607/v0-crm-web-app.git

# Hacer push
git push origin main
```

---

### ❌ Error 4: "Error de conexión con Supabase"

**Síntomas:**
- Errores en consola: "Failed to fetch"
- "Invalid API key"

**Causas:**
1. **Variables con valores incorrectos**
2. **Variables no disponibles en el cliente (falta NEXT_PUBLIC_)**

**Solución:**
1. Verifica que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén configuradas
2. Verifica que los valores sean correctos
3. Haz redeploy después de cambiar variables

---

### ❌ Error 5: "Build falla en Vercel"

**Síntomas:**
- Deployment falla con error de build
- Errores de TypeScript o compilación

**Causas:**
1. **Variables faltantes durante el build**
2. **Errores de sintaxis en el código**

**Solución:**
1. Revisa los logs del deployment en Vercel
2. Verifica que todas las variables estén configuradas
3. Ejecuta `npm run build` localmente para ver errores

---

## 🔧 Scripts de Diagnóstico

### Diagnóstico completo
```bash
npm run diagnose
```

Este script verifica:
- ✅ Variables de entorno presentes
- ✅ Conexión con Supabase
- ✅ Usuario admin existe
- ✅ Valores de variables correctos

### Verificar conexión
```bash
npm run verify
```

Verifica la conexión con Supabase usando las variables locales.

---

## 📋 Checklist de Verificación

Antes de reportar un error, verifica:

- [ ] Variables de entorno configuradas en Vercel
- [ ] Valores de variables correctos
- [ ] Deployment reciente (después de agregar variables)
- [ ] Usuario admin creado (`npm run setup-admin`)
- [ ] Webhook de GitHub activo
- [ ] Repositorio correcto conectado en Vercel
- [ ] Push hecho a la rama `main`

---

## 🚨 Errores Comunes Específicos

### "NEXT_PUBLIC_SUPABASE_URL is not defined"
**Causa:** Variable no configurada o no disponible en el cliente
**Solución:** Agrega `NEXT_PUBLIC_SUPABASE_URL` en Vercel con valor correcto

### "Invalid API key"
**Causa:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` incorrecta o faltante
**Solución:** Verifica el valor de la clave anónima en Supabase Dashboard

### "User not found"
**Causa:** Usuario admin no existe en Supabase
**Solución:** Ejecuta `npm run setup-admin`

### "Failed to fetch"
**Causa:** Problema de CORS o URL incorrecta
**Solución:** Verifica que `NEXT_PUBLIC_SUPABASE_URL` sea correcta

---

## 💡 Tips

1. **Siempre haz redeploy después de cambiar variables**
2. **Verifica los logs del deployment en Vercel**
3. **Usa `npm run diagnose` para verificar configuración**
4. **Las variables con `NEXT_PUBLIC_` son necesarias para el cliente**
5. **Las variables sin `NEXT_PUBLIC_` solo funcionan en el servidor**
