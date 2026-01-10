import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LoginPage } from "@/components/auth/login-page"

export default async function HomePage({ searchParams }: { searchParams: { message?: string } }) {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, show login (with optional success message)
  if (!user) {
    return (
      <LoginPage
        successMessage={
          searchParams.message === "password-updated"
            ? "Contraseña actualizada correctamente. Por favor inicia sesión."
            : undefined
        }
      />
    )
  }

  // User is authenticated, redirect to CRM
  try {
    const { data: countries, error } = await supabase
      .from("countries")
      .select("code")
      .eq("active", true)
      .order("name")
      .limit(1)

    if (error) {
      redirect("/countries")
    }

    if (countries && countries.length > 0) {
      redirect(`/c/${countries[0].code}/scorecards`)
    } else {
      redirect("/countries")
    }
  } catch {
    redirect("/countries")
  }
}
