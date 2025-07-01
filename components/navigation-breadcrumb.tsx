"use client"

import { usePathname } from "next/navigation"
import { ChevronLeft, Home, Clock, Beer } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface NavigationBreadcrumbProps {
  beerName?: string;
  customPath?: { href: string; label: string; icon?: React.ComponentType<{ className?: string }> }[];
  showBackButton?: boolean;
}

export default function NavigationBreadcrumb({ 
  beerName, 
  customPath, 
  showBackButton = true 
}: NavigationBreadcrumbProps) {
  const pathname = usePathname()

  const goBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  // Generate breadcrumb items based on current path
  const getBreadcrumbItems = () => {
    if (customPath) {
      return customPath
    }

    const items = []

    // Always start with home
    items.push({ href: "/", label: "My Reviews", icon: Home })

    if (pathname === "/recent") {
      items.push({ href: "/recent", label: "Recent Reviews", icon: Clock })
    } else if (pathname.startsWith("/beer/")) {
      if (beerName) {
        items.push({ href: pathname, label: beerName, icon: Beer })
      } else {
        items.push({ href: pathname, label: "Beer Details", icon: Beer })
      }
    }

    return items
  }

  const breadcrumbItems = getBreadcrumbItems()
  const isOnHomePage = pathname === "/"

  // Don't show breadcrumbs on home page unless there's a custom path
  if (isOnHomePage && !customPath) {
    return null
  }

  return (
    <div className="flex items-center gap-4 mb-4">
      {showBackButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
      )}

      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1
            const IconComponent = item.icon

            return (
              <div key={item.href} className="flex items-center">
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="flex items-center gap-1.5">
                      {IconComponent && <IconComponent className="h-4 w-4" />}
                      <span className="max-w-[200px] truncate">{item.label}</span>
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink 
                      href={item.href}
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      {IconComponent && <IconComponent className="h-4 w-4" />}
                      <span>{item.label}</span>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                
                {!isLast && <BreadcrumbSeparator />}
              </div>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
} 