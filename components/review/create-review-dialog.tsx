"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/toast-provider"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LoginForm } from "@/components/auth/login-form"

export function CreateReviewDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setOpen(false)
      setShowLogin(false)
      return
    }

    // If user is not logged in, show login form first
    if (!user) {
      setShowLogin(true)
      setOpen(true)
      showToast("Please sign in to add a review", "info")
      return
    }

    // If user is logged in, open the review form
    setOpen(true)
    router.push("/reviews/new")
  }

  const handleLoginSuccess = () => {
    setShowLogin(false)
    router.push("/reviews/new")
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        {showLogin ? (
          <>
            <DialogHeader>
              <DialogTitle>Sign In Required</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="mb-4">Please sign in to add a review.</p>
              <LoginForm onSuccess={handleLoginSuccess} />
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p>Redirecting to review form...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
