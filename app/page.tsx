import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = await createClient()

  try {
    const { data: countries, error } = await supabase
      .from("countries")
      .select("code")
      .eq("active", true)
      .order("name")
      .limit(1)

    if (error) {
      // Table doesn't exist or other error - redirect to countries for setup
      redirect("/countries")
    }

    if (countries && countries.length > 0) {
      redirect(`/c/${countries[0].code}/scorecards`)
    } else {
      redirect("/countries")
    }
  } catch {
    // If anything fails, redirect to countries page
    redirect("/countries")
  }
}
