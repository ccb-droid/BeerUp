"use client"

import Link from "next/link"
import { Beer, User, LogOut, Clock, Heart, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import { useToast } from "@/components/layout/toast-provider"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import SearchBar from "@/components/features/beers/search-bar"
import { cn } from "@/lib/utils"

export default function Header() {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith("/login") || 
                     pathname.startsWith("/register") || 
                     pathname.startsWith("/forgot-password") || 
                     pathname.startsWith("/reset-password") ||
                     pathname.startsWith("/callback")
  const { user, signOut } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      const result = await signOut()

      if (result.success) {
        toast.success("Logged out successfully")

        // Small delay to ensure auth state is updated
        setTimeout(() => {
          router.push("/")
          router.refresh()
        }, 100)
      } else {
        toast.error("Error logging out")
      }
    } catch (error) {
      console.error("Logout error:", error)
      showToast("Error logging out", "error")
    }
  }

  if (isAuthPage) return null

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-3 sm:py-4">
        {/* Top row with logo and account */}
        <div className="flex items-center justify-between mb-3">
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <Beer className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
            <span className="font-bold text-lg sm:text-xl">Malty</span>
          </Link>

          <nav>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1 sm:space-x-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login" className="text-sm sm:text-base">
                  Sign In
                </Link>
              </Button>
            )}
          </nav>
        </div>

        {/* Navigation and Search row */}
        {user && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
            {/* Main Navigation */}
            <nav className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "text-sm font-medium relative border-b-2 rounded-b-none transition-colors",
                  pathname === "/my-reviews" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Link href="/my-reviews" className="flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>My Reviews</span>
                </Link>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "text-sm font-medium relative border-b-2 rounded-b-none transition-colors",
                  pathname === "/" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Link href="/" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Recent Reviews</span>
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "text-sm font-medium relative border-b-2 rounded-b-none transition-colors",
                  pathname === "/beers" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Link href="/beers" className="flex items-center space-x-2">
                  <Grid3X3 className="h-4 w-4" />
                  <span>All Beers</span>
                </Link>
              </Button>
            </nav>

            {/* Search Bar */}
            <div className="flex-1 w-full sm:max-w-md">
              <SearchBar />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
