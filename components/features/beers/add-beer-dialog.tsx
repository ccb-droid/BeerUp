"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import { useToast } from "@/components/layout/toast-provider"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/types"

export function AddBeerDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [name, setName] = useState("")
  const [brewery, setBrewery] = useState("")
  const [style, setStyle] = useState("")
  const [description, setDescription] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { user } = useAuth()
  const router = useRouter() // Keep for potential redirects if needed, though main goal is dialog
  const { showToast } = useToast()
  const supabase = createClientComponentClient<Database>()

  const resetForm = () => {
    setName("")
    setBrewery("")
    setStyle("")
    setDescription("")
    setImageFile(null)
    setIsLoading(false)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setOpen(false)
      setShowLogin(false) // Reset login view when dialog closes
      resetForm() // Reset form when dialog closes
      return
    }

    if (!user) {
      setShowLogin(true)
      setOpen(true)
    } else {
      setShowLogin(false)
      setOpen(true)
    }
  }

  const handleLoginRedirect = () => {
    const currentPath = window.location.pathname
    router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) {
      showToast("Please sign in to add a beer.", "error")
      setShowLogin(true)
      return
    }

    if (!name.trim() || !brewery.trim()) {
      showToast("Beer Name and Brewery are required.", "error")
      return
    }

    setIsLoading(true)
    const imageUrls: string[] = []

    if (imageFile) {
      const fileName = `${user.id}/${Date.now()}-${imageFile.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("beer-images") // Ensure this bucket exists and has appropriate policies
        .upload(fileName, imageFile)

      if (uploadError) {
        showToast(`Image upload failed: ${uploadError.message}`, "error")
        setIsLoading(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from("beer-images")
        .getPublicUrl(uploadData.path)
      
      if (publicUrlData.publicUrl) {
        imageUrls.push(publicUrlData.publicUrl)
      }
    }

    const { error: insertError } = await supabase.from("beers").insert({
      name,
      brewery,
      style: style || null,
      description: description || null,
      images: imageUrls.length > 0 ? imageUrls : null,
    })

    setIsLoading(false)

    if (insertError) {
      console.error("Error inserting beer:", insertError)
      showToast(`Error adding beer: ${insertError.message}`, "error")
    } else {
      showToast("Beer added successfully!", "success")
      setOpen(false) // Close dialog on success
      resetForm() // Reset form for next time
      // Optionally, you might want to trigger a re-fetch of beers list if displayed elsewhere
      router.refresh() // Refreshes current route, useful if on a page listing beers
    }
  }

  useEffect(() => {
    // If dialog is closed, reset form state
    if (!open) {
      resetForm()
      setShowLogin(false) // Ensure login view is also reset
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        {showLogin ? (
          <>
            <DialogHeader>
              <DialogTitle>Sign In Required</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-center">
              <p className="mb-4">Please sign in to add a beer.</p>
              <Button onClick={handleLoginRedirect} className="w-full">
                Go to Sign In
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add a New Beer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Beer Name <span className="text-red-500">*</span></Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Pliny the Elder" />
              </div>
              <div>
                <Label htmlFor="brewery">Brewery <span className="text-red-500">*</span></Label>
                <Input id="brewery" value={brewery} onChange={(e) => setBrewery(e.target.value)} required placeholder="e.g., Russian River Brewing Company" />
              </div>
              <div>
                <Label htmlFor="style">Style</Label>
                <Input id="style" value={style} onChange={(e) => setStyle(e.target.value)} placeholder="e.g., IPA, Stout, Lager" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tasting notes, aroma, appearance, etc." />
              </div>
              <div>
                <Label htmlFor="image">Beer Image</Label>
                <Input id="image" type="file" onChange={handleFileChange} accept="image/*" />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Beer"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
