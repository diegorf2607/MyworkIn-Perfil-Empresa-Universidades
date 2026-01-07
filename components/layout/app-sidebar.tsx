"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Users,
  Target,
  TrendingUp,
  Trophy,
  Calendar,
  Building2,
  FileText,
  BookOpen,
  BarChart3,
  Settings,
  Globe,
  UserCircle,
  Activity,
} from "lucide-react"

interface AppSidebarProps {
  countryCode: string
}

export function AppSidebar({ countryCode }: AppSidebarProps) {
  const pathname = usePathname()
  const isGlobal = countryCode === "ALL"
  const basePath = isGlobal ? "/all" : `/c/${countryCode}`

  if (isGlobal) {
    const generalItems = [
      { title: "Overview", href: `${basePath}/overview`, icon: LayoutDashboard },
      { title: "Equipo", href: `${basePath}/team`, icon: Users },
      { title: "KDM", href: `${basePath}/kdm`, icon: UserCircle },
    ]

    const performanceItems = [
      { title: "Performance", href: `${basePath}/ventas`, icon: BarChart3 },
      { title: "Actividad", href: `${basePath}/actividad`, icon: Activity },
    ]

    const knowledgeItems = [
      { title: "Recursos", href: `${basePath}/recursos`, icon: FileText },
      { title: "Glosario", href: `${basePath}/glosario`, icon: BookOpen },
    ]

    return (
      <Sidebar>
        <SidebarHeader className="border-b border-border px-4 py-3">
          <Link href="/countries" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg p-1.5 bg-white">
              <Image
                src="/images/myworkin-logo.png"
                alt="MyWorkIn"
                width={32}
                height={32}
                className="h-7 w-7 object-contain"
              />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">MyWorkIn CRM</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Vista Global
              </p>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>General</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {generalItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Control Comercial</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {performanceItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Base de Conocimiento</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {knowledgeItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-border p-4">
          <Link
            href="/countries"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Globe className="h-4 w-4" />
            Seleccionar país
          </Link>
        </SidebarFooter>
      </Sidebar>
    )
  }

  // ... existing code para sidebar de país ...
  const crmItems = [
    { title: "Overview", href: `${basePath}/overview`, icon: LayoutDashboard },
    { title: "Leads (ICP)", href: `${basePath}/crm/leads`, icon: Users },
    { title: "SQLs", href: `${basePath}/crm/sqls`, icon: Target },
    { title: "Oportunidades", href: `${basePath}/crm/opps`, icon: TrendingUp },
    { title: "Cerradas", href: `${basePath}/crm/closed`, icon: Trophy },
  ]

  const salesItems = [
    { title: "Reuniones", href: `${basePath}/sales/meetings`, icon: Calendar },
    { title: "Secuencias", href: `${basePath}/sales/sequences`, icon: BarChart3 },
  ]

  const adminItems = [
    { title: "Universidades", href: `${basePath}/admin/universities`, icon: Building2 },
    { title: "Equipo", href: `${basePath}/admin/team`, icon: Users },
    { title: "Configuración", href: `${basePath}/admin/settings`, icon: Settings },
  ]

  const scorecardItem = { title: "Scorecard", href: `${basePath}/scorecards`, icon: BarChart3 }
  const kdmItem = { title: "KDM", href: `${basePath}/kdm`, icon: UserCircle }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border px-4 py-3">
        <Link href="/countries" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary p-1.5">
            <Image
              src="/images/myworkin-logo.png"
              alt="MyWorkIn"
              width={32}
              height={32}
              className="h-7 w-7 object-contain"
            />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">MyWorkIn CRM</h2>
            <p className="text-xs text-muted-foreground">{countryCode}</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>CRM</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {crmItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Contactos Clave</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === kdmItem.href}>
                  <Link href={kdmItem.href}>
                    <kdmItem.icon className="h-4 w-4" />
                    <span>{kdmItem.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Ventas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {salesItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === scorecardItem.href}>
                  <Link href={scorecardItem.href}>
                    <scorecardItem.icon className="h-4 w-4" />
                    <span>{scorecardItem.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <Link
          href="/countries"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Globe className="h-4 w-4" />
          Cambiar país
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}
