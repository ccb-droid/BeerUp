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
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"

import { BeerNameCombobox } from "./beer-name-combobox"
import { StarRating } from "@/components/ui/star-rating"
import { supabase } from "@/lib/supabase/client"
import { findOrCreateBeer } from "@/lib/actions/beers"
import { addReview } from "@/lib/actions/reviews"
import { resizeImage } from "@/lib/utils/image-resize"

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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  
  // Review fields
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [typicallyDrinks, setTypicallyDrinks] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)

  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()

  const resetForm = () => {
    setBeerName("")
    setSelectedBeer(null)
    setBrewery("")
    setStyle("")
    setImageFile(null)
    setIsProcessingImage(false)
    setRating(0)
    setReviewText("")
    setTypicallyDrinks(false)
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

  const handleLoginRedirect = () => {
    const currentPath = window.location.pathname
    router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`)
  }

  const handleBeerSelect = (beer: BeerOption | null) => {
    setSelectedBeer(beer)
    if (beer) {
      // Pre-fill brewery and style if we selected an existing beer
      setBrewery(beer.brewery)
      setStyle(beer.style || "")
    }
  }

  const processImageFile = async (file: File) => {
    // Check if it's an image file (including HEIC/HEIF for iPhone)
    const isImage = file.type.startsWith('image/') ||
                    file.name.toLowerCase().endsWith('.heic') ||
                    file.name.toLowerCase().endsWith('.heif')

    if (!isImage) {
      showToast("Please select an image file.", "error")
      return
    }

    // Check file size (10MB limit before resizing to accommodate HEIC files)
    const maxFileSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxFileSize) {
      showToast("Image file is too large. Please select an image under 10MB.", "error")
      return
    }

    setIsProcessingImage(true)

    try {
      // Resize image to stay within limits (this will convert HEIC to JPEG)
      const resizedFile = await resizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        outputFormat: 'jpeg'
      })

      setImageFile(resizedFile)
      showToast("Image processed successfully!", "success")
    } catch (error) {
      console.error("Error resizing image:", error)
      showToast("Failed to process image. Please try a different image.", "error")
    } finally {
      setIsProcessingImage(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processImageFile(e.target.files[0])
    }
  }

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processImageFile(e.target.files[0])
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

    // If it's a new beer (not selected from existing), image is required
    if (!selectedBeer && !imageFile) {
      showToast("For new beers, an image is required.", "error")
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
      let beerImageUrl: string | null = null

      if (selectedBeer) {
        // User selected an existing beer
        beerId = selectedBeer.id
      } else {
        // User typed a new beer name, need to create the beer
        // For new beers, image is required and goes to both beer and review
        if (imageFile) {
          const fileName = `beers/${user.id}/${Date.now()}-${imageFile.name}`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("beer-images")
            .upload(fileName, imageFile)

          if (uploadError) {
            console.error("Error uploading new beer image:", uploadError)
            showToast(`Image upload failed: ${uploadError.message}`, "error")
            setIsLoading(false)
            return
          }

          const { data: publicUrlData } = supabase.storage
            .from("beer-images")
            .getPublicUrl(uploadData.path)
          
          beerImageUrl = publicUrlData.publicUrl
        }

        // Create or find the beer
        const newBeer = await findOrCreateBeer(
          beerName.trim(),
          brewery.trim(),
          style.trim(),
          beerImageUrl || undefined
        )

        if (!newBeer?.id) {
          console.error("Failed to create or find beer, response:", newBeer)
          throw new Error("Failed to create or find beer")
        }

        beerId = newBeer.id
      }

      // Create the review using FormData (as expected by addReview action)
      const formData = new FormData()
      formData.append("beerId", beerId)
      formData.append("rating", rating.toString())
      formData.append("reviewText", reviewText.trim())
      formData.append("typicallyDrinks", typicallyDrinks.toString())

      // Handle review image upload
      if (imageFile) {
        if (selectedBeer) {
          // For existing beers, upload image for review only
          formData.append("imageFile", imageFile)
        } else {
          // For new beers, the same image goes to both beer and review
          formData.append("imageFile", imageFile)
        }
      }

      const result = await addReview(formData)

      if (!result.success) {
        console.error("addReview action failed:", result.error)
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
      
    } catch (error: unknown) {
      console.error("Error creating review:", {
        message: error instanceof Error ? error.message : "Unknown error",
        beerName,
        selectedBeer,
        brewery,
        style,
        hasImage: !!imageFile,
        rating,
        reviewTextLength: reviewText.length,
        errorObject: error
      })
      showToast(error instanceof Error ? error.message : "Failed to add review. Please contact nic/david.", "error")
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
            <div className="py-4 text-center">
              <p className="mb-4">Please sign in to add a review.</p>
              <Button onClick={handleLoginRedirect} className="w-full">
                Go to Sign In
              </Button>
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
                  <Label htmlFor="image">
                    {selectedBeer ? "Review Image (Optional)" : "Beer Image"}
                    {!selectedBeer && <span className="text-red-500"> *</span>}
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <div className="flex-1">
                      <Input
                        id="camera-input"
                        type="file"
                        onChange={handleCameraCapture}
                        accept="image/*,.heic,.heif"
                        capture="environment"
                        disabled={isLoading || isProcessingImage}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={isLoading || isProcessingImage}
                        onClick={() => document.getElementById('camera-input')?.click()}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                          <circle cx="12" cy="13" r="3" />
                        </svg>
                        Take Photo
                      </Button>
                    </div>
                    <div className="flex-1">
                      <Input
                        id="gallery-input"
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*,.heic,.heif"
                        disabled={isLoading || isProcessingImage}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={isLoading || isProcessingImage}
                        onClick={() => document.getElementById('gallery-input')?.click()}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        Choose from Gallery
                      </Button>
                    </div>
                  </div>
                  {isProcessingImage && (
                    <p className="text-sm text-blue-600 mt-1 flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                      Processing image...
                    </p>
                  )}
                  {imageFile && !isProcessingImage && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ Image ready ({(imageFile.size / 1024).toFixed(1)}KB)
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedBeer
                      ? "Upload an image specific to your review (optional). Images will be automatically resized."
                      : "Required for new beers - will be used as the main beer image. Images will be automatically resized."
                    }
                  </p>
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
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="typicallyDrinks"
                    checked={typicallyDrinks}
                    onCheckedChange={(checked) => setTypicallyDrinks(checked === true)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="typicallyDrinks" className="text-sm font-normal cursor-pointer">
                    I typically drink this style
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isLoading || isProcessingImage}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading || isProcessingImage}>
                  {isLoading ? "Adding Review..." : isProcessingImage ? "Processing Image..." : "Add Review"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 