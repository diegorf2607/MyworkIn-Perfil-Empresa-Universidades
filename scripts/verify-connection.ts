// scripts/verify-connection.ts
import dotenv from 'dotenv';
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: '.env.local' });

async function verifyConnection() {
  console.log("🔍 Verificando conexión con Supabase...\n");

  // Verificar variables de entorno
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missingVars: string[] = [];
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error("❌ Faltan las siguientes variables de entorno:");
    missingVars.forEach(v => console.error(`   - ${v}`));
    console.error("\nPor favor, agrega estas variables a tu archivo .env.local");
    process.exit(1);
  }

  console.log("✅ Todas las variables de entorno están presentes\n");

  // Verificar conexión con Supabase usando Service Role Key
  console.log("🔗 Verificando conexión con Supabase (Service Role)...");
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (error) {
      console.error("❌ Error de conexión:", error.message);
      process.exit(1);
    }
    console.log("✅ Conexión con Supabase (Service Role) exitosa\n");
  } catch (err: any) {
    console.error("❌ Error de conexión:", err.message);
    process.exit(1);
  }

  // Verificar conexión con Anon Key
  console.log("🔗 Verificando conexión con Supabase (Anon Key)...");
  const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // Intentar una consulta simple para verificar la conexión
    const { data, error } = await supabaseAnon.from('team_members').select('count').limit(1);
    if (error) {
      // Si hay error de política RLS, la conexión funciona pero necesita configuración
      if (error.message.includes('permission denied') || 
          error.message.includes('infinite recursion') ||
          error.message.includes('policy')) {
        console.log("⚠️  Conexión exitosa, pero hay problemas con políticas RLS");
        console.log("   Esto es normal si las políticas aún no están configuradas en Supabase");
        console.log("   La conexión funciona correctamente\n");
      } else {
        console.error("❌ Error de conexión:", error.message);
        process.exit(1);
      }
    } else {
      console.log("✅ Conexión con Supabase (Anon Key) exitosa\n");
    }
  } catch (err: any) {
    // Si es un error de política, la conexión funciona
    if (err.message?.includes('policy') || err.message?.includes('permission')) {
      console.log("⚠️  Conexión exitosa, pero hay problemas con políticas RLS");
      console.log("   Esto es normal si las políticas aún no están configuradas en Supabase");
      console.log("   La conexión funciona correctamente\n");
    } else {
      console.error("❌ Error de conexión:", err.message);
      process.exit(1);
    }
  }

  console.log("🎉 ¡Todas las verificaciones pasaron exitosamente!");
  console.log("\n📋 Resumen:");
  console.log(`   - URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log(`   - Service Role Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20)}...`);
  console.log(`   - Anon Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...`);
}

verifyConnection();
