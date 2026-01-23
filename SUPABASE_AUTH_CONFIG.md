# Configuración de Supabase para Recuperación de Contraseña

## Pasos de configuración en Supabase Dashboard

1. Ve a tu proyecto en Supabase Dashboard: https://app.supabase.com
2. Navega a **Authentication** > **URL Configuration**
3. Configura los siguientes valores:

### Site URL
- **Desarrollo local**: `http://localhost:3000`
- **Producción**: `https://tu-dominio.com` (reemplaza con tu dominio real)

### Redirect URLs
Agrega las siguientes URLs a la lista de "Redirect URLs" permitidas:

**Para desarrollo:**
```
http://localhost:3000/auth/reset
http://localhost:3000/*
```

**Para producción:**
```
https://tu-dominio.com/auth/reset
https://tu-dominio.com/*
```

4. Guarda los cambios haciendo clic en "Save"

## Variables de entorno

Asegúrate de tener configurada la variable de entorno:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

En producción, cámbiala a tu dominio real:
```env
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
```

## Plantilla de email (opcional)

Si quieres personalizar el email de recuperación:

1. Ve a **Authentication** > **Email Templates**
2. Selecciona "Reset Password"
3. Personaliza el contenido del email (opcional)

## Flujo de recuperación de contraseña

1. Usuario hace clic en "¿Olvidaste tu contraseña?" en el login
2. Ingresa su email y hace clic en "Enviar enlace"
3. Supabase envía un email con un enlace único que incluye tokens de recuperación
4. Usuario hace clic en el enlace del email
5. Es redirigido a `/auth/reset` con los tokens en la URL
6. Ingresa su nueva contraseña
7. La contraseña se actualiza y la sesión se cierra automáticamente
8. Usuario es redirigido al login para iniciar sesión con la nueva contraseña

## Notas importantes

- Los enlaces de recuperación expiran después de 1 hora por defecto
- Puedes cambiar el tiempo de expiración en **Authentication** > **Policies** > **Password Recovery**
- Si el usuario no recibe el email, revisa la bandeja de spam
- Para testing, puedes ver los emails enviados en **Authentication** > **Logs**
