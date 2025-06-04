// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { ArrowLeft, Upload } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { Label } from "@/components/ui/label"
// import { Slider } from "@/components/ui/slider"
// import { Switch } from "@/components/ui/switch"
// import Link from "next/link"
// import Image from "next/image"
// import { useRouter } from "next/navigation"
// import { useAuth } from "@/contexts/auth-context"
// import { useToast } from "@/components/toast-provider"
// import { uploadMultipleImages } from "@/lib/storage"
// import { createBeer, findOrCreateBeer } from "@/lib/actions/beers"
// import { addReview } from "@/lib/actions/reviewActions"

// export default function NewReviewPage() {
//   const [images, setImages] = useState<File[]>([])
//   const [imageUrls, setImageUrls] = useState<string[]>([])
//   const [brewery, setBrewery] = useState("")
//   const [beerName, setBeerName] = useState("")
//   const [beerStyle, setBeerStyle] = useState("")
//   const [rating, setRating] = useState(3)
//   const [reviewText, setReviewText] = useState("")
//   const [typicallyDrinks, setTypicallyDrinks] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState("")
//   const [validationErrors, setValidationErrors] = useState<string[]>([])

//   const router = useRouter()
//   const { user, isLoading: authLoading } = useAuth()
//   const { showToast } = useToast()
//   // Redirect if not authenticated
//   useEffect(() => {
//     if (!authLoading && !user) {
//       showToast("Please sign in to add a review", "error")
//       router.push("/auth/login?redirectTo=/reviews/new")
//     }
//   }, [user, authLoading, router, showToast])

//   // Validation function
//   const validateForm = () => {
//     const errors: string[] = []

//     if (!brewery.trim()) {
//       errors.push("Brewery name is required")
//     }

//     if (!beerName.trim()) {
//       errors.push("Beer name is required")
//     }

//     if (!beerStyle.trim()) {
//       errors.push("Beer style is required")
//     }

//     if (!reviewText.trim()) {
//       errors.push("Review text is required")
//     } else if (reviewText.length > 400) {
//       errors.push("Review text must be 400 characters or less")
//     }

//     if (rating < 1 || rating > 5) {
//       errors.push("Rating must be between 1 and 5")
//     }

//     setValidationErrors(errors)
//     return errors.length === 0
//   }

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const newFiles = Array.from(e.target.files)
//       const totalImages = images.length + newFiles.length

//       if (totalImages > 3) {
//         showToast("You can only upload up to 3 images", "error")
//         return
//       }

//       const newImages = [...images, ...newFiles]
//       setImages(newImages)

//       // Create preview URLs
//       const newImageUrls = newImages.map((file) => URL.createObjectURL(file))
//       setImageUrls(newImageUrls)
//     }
//   }

//   const handleRemoveImage = (index: number) => {
//     const newImages = [...images]
//     newImages.splice(index, 1)
//     setImages(newImages)

//     const newImageUrls = [...imageUrls]
//     URL.revokeObjectURL(newImageUrls[index])
//     newImageUrls.splice(index, 1)
//     setImageUrls(newImageUrls)
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError("")
//     setValidationErrors([])

//     if (!user) {
//       showToast("Please sign in to add a review", "error")
//       router.push("/auth/login?redirectTo=/reviews/new")
//       return
//     }

//     if (!validateForm()) {
//       return
//     }

//     setIsLoading(true)

//     try {
//       // 1. Upload images to Supabase Storage
//       const uploadedImageUrls = await uploadMultipleImages(images)

//       // 2. Create or find beer
//       let beerId
//       const existingBeer = await findOrCreateBeer(beerName, brewery, beerStyle, uploadedImageUrls)

//       if (existingBeer && existingBeer.id) {
//         beerId = existingBeer.id
//       } else {
//         const newBeer = await createBeer({
//           name: beerName,
//           brewery: brewery,
//           style: beerStyle,
//         })

//         if (!newBeer || !newBeer.id) {
//           throw new Error("Failed to create or retrieve beer ID")
//         }
//         beerId = newBeer.id
//       }

//       // Add a check for beerId before creating review
//       if (!beerId) {
//         throw new Error("Beer ID is missing, cannot create review.")
//       }

//       console.log("Attempting to create review with beerId:", beerId);

//       // 3. Create review
//       const newReview = await addReview({
//         user_id: user.id,
//         beer_id: beerId,
//         rating: rating,
//         review_text: reviewText,
//         typically_drinks: typicallyDrinks,
//       })

//       if (!newReview) {
//         throw new Error("Failed to create review")
//       }

//       showToast("Review added successfully!", "success")

//       // 4. Redirect to review page
//       console.log("Redirecting to review page with ID:", newReview.id)
//       router.push(`/reviews/${newReview.id}`)
//     } catch (error: any) {
//       setError(error.message || "An error occurred while creating your review")
//       showToast("Failed to add review", "error")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Show loading while checking auth
//   if (authLoading) {
//     return (
//       <div className="container max-w-2xl py-6">
//         <div className="text-center py-10">Loading...</div>
//       </div>
//     )
//   }

//   // Don't render form if not authenticated
//   if (!user) {
//     return null
//   }

//   return (
//     <div className="container max-w-2xl py-6 space-y-6">
//       <div className="flex items-center space-x-2">
//         <Button variant="ghost" size="icon" asChild>
//           <Link href="/">
//             <ArrowLeft className="h-4 w-4" />
//           </Link>
//         </Button>
//         <h1 className="text-2xl font-bold">Add New Review</h1>
//       </div>

//       {error && <div className="bg-destructive/15 text-destructive p-3 rounded-md">{error}</div>}

//       {validationErrors.length > 0 && (
//         <div className="bg-destructive/15 text-destructive p-3 rounded-md">
//           <p className="font-medium mb-2">Please fix the following errors:</p>
//           <ul className="list-disc list-inside">
//             {validationErrors.map((error, index) => (
//               <li key={index}>{error}</li>
//             ))}
//           </ul>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="space-y-2">
//           <Label htmlFor="images">Beer Images (Max 3)</Label>
//           <div className="flex items-center space-x-4">
//             {images.length < 3 && (
//               <div className="relative h-24 w-24 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-accent/50">
//                 <input
//                   type="file"
//                   id="images"
//                   accept="image/*"
//                   className="absolute inset-0 opacity-0 cursor-pointer"
//                   onChange={handleImageUpload}
//                   multiple
//                   max={3}
//                   disabled={isLoading}
//                 />
//                 <Upload className="h-6 w-6 text-muted-foreground" />
//               </div>
//             )}

//             {imageUrls.map((image, index) => (
//               <div key={index} className="relative h-24 w-24 rounded-md overflow-hidden">
//                 <Image
//                   src={image || "/placeholder.svg"}
//                   alt={`Uploaded image ${index + 1}`}
//                   fill
//                   className="object-cover"
//                 />
//                 <Button
//                   type="button"
//                   variant="destructive"
//                   size="icon"
//                   className="absolute top-1 right-1 h-5 w-5 rounded-full"
//                   onClick={() => handleRemoveImage(index)}
//                   disabled={isLoading}
//                 >
//                   ×
//                 </Button>
//               </div>
//             ))}
//           </div>
//           <p className="text-sm text-muted-foreground">{images.length}/3 images uploaded</p>
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="brewery">Brewery</Label>
//           <Input
//             id="brewery"
//             placeholder="Enter brewery name"
//             value={brewery}
//             onChange={(e) => setBrewery(e.target.value)}
//             required
//             disabled={isLoading}
//             className={validationErrors.some((e) => e.includes("Brewery")) ? "border-red-500" : ""}
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="name">Beer Name</Label>
//           <Input
//             id="name"
//             placeholder="Enter beer name"
//             value={beerName}
//             onChange={(e) => setBeerName(e.target.value)}
//             required
//             disabled={isLoading}
//             className={validationErrors.some((e) => e.includes("Beer name")) ? "border-red-500" : ""}
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="style">Beer Style</Label>
//           <Input
//             id="style"
//             placeholder="e.g., IPA, Stout, Lager"
//             value={beerStyle}
//             onChange={(e) => setBeerStyle(e.target.value)}
//             required
//             disabled={isLoading}
//             className={validationErrors.some((e) => e.includes("Beer style")) ? "border-red-500" : ""}
//           />
//         </div>

//         <div className="space-y-2">
//           <Label>Rating ({rating}/5)</Label>
//           <Slider
//             value={[rating]}
//             min={1}
//             max={5}
//             step={0.1}
//             onValueChange={(value) => setRating(value[0])}
//             disabled={isLoading}
//           />
//         </div>

//         <div className="flex items-center space-x-2">
//           <Switch
//             id="typically-drinks"
//             checked={typicallyDrinks}
//             onCheckedChange={setTypicallyDrinks}
//             disabled={isLoading}
//           />
//           <Label htmlFor="typically-drinks">I typically drink this style of beer</Label>
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="review">Review</Label>
//           <Textarea
//             id="review"
//             placeholder="Share your thoughts on this beer (max 400 characters)"
//             maxLength={400}
//             rows={4}
//             value={reviewText}
//             onChange={(e) => setReviewText(e.target.value)}
//             required
//             disabled={isLoading}
//             className={validationErrors.some((e) => e.includes("Review text")) ? "border-red-500" : ""}
//           />
//           <p className="text-sm text-muted-foreground text-right">{reviewText.length}/400 characters</p>
//         </div>

//         <div className="flex justify-end space-x-2">
//           <Button type="button" variant="outline" asChild disabled={isLoading}>
//             <Link href="/">Cancel</Link>
//           </Button>
//           <Button type="submit" disabled={isLoading}>
//             {isLoading ? "Submitting..." : "Submit Review"}
//           </Button>
//         </div>
//       </form>
//     </div>
//   )
// }
