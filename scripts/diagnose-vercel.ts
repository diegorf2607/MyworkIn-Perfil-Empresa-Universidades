// Script de diagnóstico para verificar configuración
import dotenv from 'dotenv';
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: '.env.local' });

console.log("🔍 DIAGNÓSTICO DE CONFIGURACIÓN\n");

// 1. Verificar variables de entorno
console.log("1️⃣ Verificando variables de entorno...\n");

const requiredVars = {
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'SUPABASE_URL': process.env.SUPABASE_URL,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
};

let allVarsPresent = true;
for (const [key, value] of Object.entries(requiredVars)) {
  if (value) {
    console.log(`✅ ${key}: ${value.substring(0, 30)}...`);
  } else {
    console.log(`❌ ${key}: FALTA`);
    allVarsPresent = false;
  }
}

if (!allVarsPresent) {
  console.log("\n⚠️  Faltan variables de entorno. Configúralas en Vercel.");
  process.exit(1);
}

console.log("\n✅ Todas las variables están presentes\n");

// 2. Verificar conexión con Supabase
console.log("2️⃣ Verificando conexión con Supabase...\n");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, anonKey);

try {
  // Intentar una consulta simple
  const { data, error } = await supabase.from('team_members').select('count').limit(1);
  
  if (error) {
    if (error.message.includes('permission denied') || error.message.includes('policy')) {
      console.log("⚠️  Conexión OK, pero hay problemas con políticas RLS");
      console.log("   Esto es normal si las políticas aún no están configuradas\n");
    } else {
      console.log(`❌ Error de conexión: ${error.message}\n`);
      process.exit(1);
    }
  } else {
    console.log("✅ Conexión con Supabase exitosa\n");
  }
} catch (err: any) {
  console.log(`❌ Error: ${err.message}\n`);
  process.exit(1);
}

// 3. Verificar usuario admin
console.log("3️⃣ Verificando usuario admin...\n");

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

try {
  const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (listError) {
    console.log(`❌ Error al listar usuarios: ${listError.message}\n`);
    process.exit(1);
  }

  const adminUser = users.users.find(u => u.email === 'admin@myworkkin.pe');
  
  if (adminUser) {
    console.log("✅ Usuario admin existe:");
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Confirmado: ${adminUser.email_confirmed_at ? 'Sí' : 'No'}\n`);
  } else {
    console.log("⚠️  Usuario admin NO existe");
    console.log("   Ejecuta: npm run setup-admin\n");
  }
} catch (err: any) {
  console.log(`❌ Error: ${err.message}\n`);
  process.exit(1);
}

// 4. Verificar valores de las variables
console.log("4️⃣ Verificando valores de las variables...\n");

const urlPattern = /^https:\/\/[a-z0-9-]+\.supabase\.co$/;
if (!urlPattern.test(supabaseUrl)) {
  console.log(`⚠️  NEXT_PUBLIC_SUPABASE_URL parece incorrecta: ${supabaseUrl}`);
  console.log("   Debe ser: https://tu-proyecto.supabase.co\n");
}

if (anonKey.length < 100) {
  console.log(`⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY parece muy corta`);
  console.log("   Verifica que sea la clave anónima correcta\n");
}

console.log("✅ Diagnóstico completado\n");
console.log("📋 RESUMEN:");
console.log("   - Variables de entorno: ✅");
console.log("   - Conexión Supabase: ✅");
console.log("   - Usuario admin: Verificar manualmente");
console.log("\n💡 Si todo está OK pero el login no funciona:");
console.log("   1. Verifica que las variables en Vercel tengan los valores correctos");
console.log("   2. Haz un redeploy en Vercel después de agregar/modificar variables");
console.log("   3. Verifica los logs del deployment en Vercel");
