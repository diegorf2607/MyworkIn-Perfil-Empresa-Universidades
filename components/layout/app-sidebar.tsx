"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import MyWorkInLogo from "@/components/MyWorkInLogo"
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher"
import { useWorkspace } from "@/lib/context/workspace-context"
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
  Globe,
  UserCircle,
  Activity,
  Mail,
  Kanban,
  GraduationCap,
} from "lucide-react"

interface AppSidebarProps {
  countryCode: string
}

export function AppSidebar({ countryCode }: AppSidebarProps) {
  const pathname = usePathname()
  const { config, workspace } = useWorkspace()
  const isGlobal = countryCode === "ALL"
  const basePath = isGlobal ? "/all" : `/c/${countryCode}`

  // Colores dinámicos según workspace
  const sidebarBg = workspace === "mkn" ? "bg-black" : "bg-[#005691]"

  if (isGlobal) {
    const generalItems = [
      { title: "Overview", href: `${basePath}/overview`, icon: LayoutDashboard },
      { title: "Equipo", href: `${basePath}/team`, icon: Users },
      { title: "KDM", href: `${basePath}/kdm`, icon: UserCircle },
    ]

    const performanceItems = [
      { title: "Performance", href: `${basePath}/ventas`, icon: BarChart3 },
      { title: "Pipeline", href: `${basePath}/pipeline`, icon: Kanban },
      { title: "Actividad", href: `${basePath}/actividad`, icon: Activity },
    ]

    const knowledgeItems = [
      { title: "Recursos", href: `${basePath}/recursos`, icon: FileText },
      { title: "Glosario", href: `${basePath}/glosario`, icon: BookOpen },
    ]

    return (
      <Sidebar className={sidebarBg}>
        <SidebarHeader className="border-b border-white/15 px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/all/overview" className="flex items-center gap-3">
              {workspace === "myworkin" ? (
                <>
                  <MyWorkInLogo variant="icon" size="sm" className="text-white" />
                  <div>
                    <h2 className="font-semibold text-white">{config.displayName}</h2>
                    <p className="text-xs text-white/70 flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Vista Global
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col">
                  <Image
                    src="/images/mkn-logo.png"
                    alt="MKN Technologies"
                    width={140}
                    height={32}
                    className="h-6 object-contain"
                  />
                  <p className="text-xs text-white/70 flex items-center gap-1 mt-1">
                    <Globe className="h-3 w-3" />
                    Vista Global
                  </p>
                </div>
              )}
            </Link>
          </div>
          <div className="mt-3">
            <WorkspaceSwitcher variant="sidebar" />
          </div>
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

        <SidebarFooter className="border-t border-white/15 p-4">
          <Link
            href="/countries"
            className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
          >
            <Globe className="h-4 w-4" />
            Seleccionar país
          </Link>
        </SidebarFooter>
      </Sidebar>
    )
  }

  // Sections: Main, CRM, GESTIÓN COMERCIAL, ADMINISTRACIÓN
  // Removed only: "Recursos de Venta" and "Glosario Comercial" (now in Global)

  const mainItems = [
    { title: "Overview", href: `${basePath}/overview`, icon: LayoutDashboard },
    { title: "Scorecards", href: `${basePath}/scorecards`, icon: BarChart3 },
  ]

  const crmItems = [
    { title: config.terminology.leadsTitle, href: `${basePath}/crm/leads`, icon: Users },
    { title: "SQLs", href: `${basePath}/crm/sqls`, icon: Target },
    { title: "Oportunidades", href: `${basePath}/crm/opps`, icon: TrendingUp },
    { title: config.terminology.closedTitle, href: `${basePath}/crm/closed`, icon: Trophy },
  ]

  const salesItems = [
    { title: "Reuniones", href: `${basePath}/sales/meetings`, icon: Calendar },
    { title: "Secuencias Outbound", href: `${basePath}/sales/sequences`, icon: Mail },
  ]

  const adminItems = [
    { title: config.terminology.databaseTitle, href: `${basePath}/admin/universities`, icon: Building2 },
    { title: "KDM", href: `${basePath}/kdm`, icon: UserCircle },
  ]

  return (
    <Sidebar className={sidebarBg}>
      <SidebarHeader className="border-b border-white/15 px-4 py-3">
        <Link href={`/c/${countryCode}/overview`} className="flex items-center gap-3">
          {workspace === "myworkin" ? (
            <>
              <MyWorkInLogo variant="icon" size="sm" className="text-white" />
              <div>
                <h2 className="font-semibold text-white">{config.shortName}</h2>
              </div>
            </>
          ) : (
            <Image
              src="/images/mkn-logo.png"
              alt="MKN Technologies"
              width={140}
              height={32}
              className="h-6 object-contain"
            />
          )}
        </Link>
        <div className="mt-3">
          <WorkspaceSwitcher variant="sidebar" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Section */}
        <SidebarGroup>
          <SidebarGroupLabel>{config.shortName.toUpperCase()}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
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

        {/* CRM Section */}
        <SidebarGroup>
          <SidebarGroupLabel>CRM</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {crmItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href || pathname.startsWith(item.href)}>
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

        {/* GESTIÓN COMERCIAL Section */}
        <SidebarGroup>
          <SidebarGroupLabel>GESTIÓN COMERCIAL</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {salesItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href || pathname.startsWith(item.href)}>
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

        {/* ADMINISTRACIÓN Section */}
        <SidebarGroup>
          <SidebarGroupLabel>ADMINISTRACIÓN</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href || pathname.startsWith(item.href)}>
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

      <SidebarFooter className="border-t border-white/15 p-4">
        <Link
          href="/countries"
          className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
        >
          <Globe className="h-4 w-4" />
          Seleccionar país
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}
