"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import { useToast } from "@/components/layout/toast-provider"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addToWaitlist } from "@/lib/actions/waitlist"
import type { Beer } from "@/lib/types"
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"

interface WaitlistDialogProps {
  beer: Beer
  children: React.ReactNode
}

export function WaitlistDialog({ beer, children }: WaitlistDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState("")
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const pathname = usePathname()

  const handleLoginRedirect = () => {
    const currentPath = pathname
    router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      showToast("Please log in to join the waitlist", "error")
      return
    }

    setIsSubmitting(true)

         try {
       const result = await addToWaitlist({
         beer_id: beer.id,
         quantity,
         phone_number: phoneNumber.trim() ? `+65${phoneNumber.trim()}` : undefined,
       })

      if (result) {
        showToast(`You'll be notified when ${beer.name} is available`, "success")
        setOpen(false)
        // Reset form
        setQuantity(1)
        setPhoneNumber("")
      } else {
        showToast("Failed to join waitlist. Please try again later", "error")
      }
    } catch (error) {
      console.error("Error adding to waitlist:", error)
      showToast("Something went wrong. Please try again.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Waitlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">{beer.name}</h4>
            <p className="text-sm text-muted-foreground">{beer.brewery}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ""}
              disabled
              className="bg-muted"
            />
            {!user && (
              <p className="text-xs text-muted-foreground">
                Sign in to see your email address
              </p>
            )}
            {user && (
              <p className="text-xs text-muted-foreground">
                We&apos;ll notify you at this email when the beer is available
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Select 
              value={quantity.toString()} 
              onValueChange={(value) => setQuantity(parseInt(value))}
              disabled={!user}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a quantity" defaultValue={quantity.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="7">7</SelectItem>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="9">9</SelectItem>
                <SelectItem value="10">10</SelectItem>
              </SelectContent>
            </Select>
          </div>

                     <div className="space-y-2">
             <Label htmlFor="phone">Phone Number (Optional)</Label>
             <div className="flex gap-2">
               <div className="w-20">
                 <Select value="+65" disabled>
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="+65">+65</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <Input
                 id="phone"
                 type="tel"
                 placeholder="9123 4567"
                 value={phoneNumber}
                 onChange={(e) => setPhoneNumber(e.target.value)}
                 className="flex-1"
                 disabled={!user}
               />
             </div>
             <p className="text-xs text-muted-foreground">
               For SMS notifications (optional)
             </p>
           </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {user ? (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Notify me"}
              </Button>
            ) : (
              <Button type="button" onClick={handleLoginRedirect}>
                Sign in to join waitlist
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}