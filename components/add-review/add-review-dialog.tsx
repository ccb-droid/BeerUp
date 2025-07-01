"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/client"
import { useToast } from "@/components/toast-provider"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { LoginForm } from "@/components/auth/login-form"
import { BeerNameCombobox } from "./beer-name-combobox"
import { StarRating } from "@/components/ui/star-rating"
import { supabase } from "@/lib/supabase/client"
import { findOrCreateBeer } from "@/lib/actions/beers"
import { addReview } from "@/lib/actions/reviewActions"

interface BeerOption {
  id: string
  name: string
  brewery: string
  style?: string
}

export function AddReviewDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  
  // Beer fields
  const [beerName, setBeerName] = useState("")
  const [selectedBeer, setSelectedBeer] = useState<BeerOption | null>(null)
  const [brewery, setBrewery] = useState("")
  const [style, setStyle] = useState("")
  const [description, setDescription] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  // Review fields
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  
  const [isLoading, setIsLoading] = useState(false)

  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()

  const resetForm = () => {
    setBeerName("")
    setSelectedBeer(null)
    setBrewery("")
    setStyle("")
    setDescription("")
    setImageFile(null)
    setRating(0)
    setReviewText("")
    setIsLoading(false)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setOpen(false)
      setShowLogin(false)
      resetForm()
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

  const handleLoginSuccess = () => {
    setShowLogin(false)
    resetForm()
  }

  const handleBeerSelect = (beer: BeerOption | null) => {
    setSelectedBeer(beer)
    if (beer) {
      // Pre-fill brewery and style if we selected an existing beer
      setBrewery(beer.brewery)
      setStyle(beer.style || "")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const validateForm = () => {
    if (!beerName.trim()) {
      showToast("Beer name is required.", "error")
      return false
    }
    
    if (!brewery.trim()) {
      showToast("Brewery is required.", "error")
      return false
    }
    
    if (rating < 1 || rating > 5) {
      showToast("Please select a rating from 1 to 5 stars.", "error")
      return false
    }
    
    if (!reviewText.trim()) {
      showToast("Review text is required.", "error")
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!user) {
      showToast("Please sign in to add a review.", "error")
      setShowLogin(true)
      return
    }

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      let beerId: string

      if (selectedBeer) {
        // User selected an existing beer
        beerId = selectedBeer.id
      } else {
        // User typed a new beer name, need to create the beer
        let imageUrls: string[] = []

        // Upload image if provided
        if (imageFile) {
          const fileName = `${user.id}/${Date.now()}-${imageFile.name}`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("beer-images")
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

        // Create or find the beer
        const newBeer = await findOrCreateBeer(
          beerName.trim(),
          brewery.trim(),
          style.trim(),
          imageUrls
        )

        if (!newBeer?.id) {
          throw new Error("Failed to create or find beer")
        }

        beerId = newBeer.id
      }

      // Create the review using FormData (as expected by addReview action)
      const formData = new FormData()
      formData.append("beerId", beerId)
      formData.append("rating", rating.toString())
      formData.append("reviewText", reviewText.trim())

      const result = await addReview(formData)

      if (!result.success) {
        throw new Error(result.error || "Failed to create review")
      }

      showToast("Review added successfully!", "success")
      setOpen(false)
      resetForm()
      
      // Refresh the current page to show the new review
      router.refresh()
      
      // Optionally redirect to the beer page with the new review
      if (result.reviewId) {
        // For now, just refresh. In Phase 2, we'll update this to navigate to the beer page
        console.log("Review created with ID:", result.reviewId)
      }
      
    } catch (error: any) {
      console.error("Error creating review:", error)
      showToast(error.message || "Failed to add review", "error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!open) {
      resetForm()
      setShowLogin(false)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
          <>
            <DialogHeader>
              <DialogTitle>Add a Review</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              {/* Beer Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Beer Information</h3>
                
                <div>
                  <Label htmlFor="beerName">Beer Name <span className="text-red-500">*</span></Label>
                  <BeerNameCombobox
                    value={beerName}
                    onValueChange={setBeerName}
                    onBeerSelect={handleBeerSelect}
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="brewery">Brewery <span className="text-red-500">*</span></Label>
                  <Input 
                    id="brewery" 
                    value={brewery} 
                    onChange={(e) => setBrewery(e.target.value)} 
                    required 
                    placeholder="e.g., Russian River Brewing Company"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="style">Style</Label>
                  <Input 
                    id="style" 
                    value={style} 
                    onChange={(e) => setStyle(e.target.value)} 
                    placeholder="e.g., IPA, Stout, Lager"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Tasting notes, aroma, appearance, etc."
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="image">Beer Image</Label>
                  <Input 
                    id="image" 
                    type="file" 
                    onChange={handleFileChange} 
                    accept="image/*"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Separator />

              {/* Review Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Your Review</h3>
                
                <div>
                  <Label>Rating <span className="text-red-500">*</span></Label>
                  <div className="mt-2">
                    <StarRating
                      rating={rating}
                      onRatingChange={setRating}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="reviewText">Review <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="reviewText"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your thoughts about this beer..."
                    required
                    disabled={isLoading}
                    rows={4}
                  />
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isLoading}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding Review..." : "Add Review"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 