"use client"

import Link from "next/link"
import { Beer, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/toast-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Header() {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith("/auth")
  const { user, signOut } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      const result = await signOut()

      if (result.success) {
        showToast("Logged out successfully", "success")

        // Small delay to ensure auth state is updated
        setTimeout(() => {
          router.push("/")
          router.refresh()
        }, 100)
      } else {
        showToast("Error logging out", "error")
      }
    } catch (error) {
      console.error("Logout error:", error)
      showToast("Error logging out", "error")
    }
  }

  if (isAuthPage) return null

  return (
    <header className="border-b">
      <div className="container max-w-4xl py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Beer className="h-6 w-6 text-amber-500" />
          <span className="font-bold text-xl">BeerUp</span>
        </Link>

        <nav>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/account">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
