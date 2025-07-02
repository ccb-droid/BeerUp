import { Suspense } from "react"
import RecentReviews from "@/components/features/reviews/recent-reviews"
import NavigationBreadcrumb from "@/components/layout/navigation-breadcrumb"

export default function RecentReviewsPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Navigation Breadcrumb */}
      <NavigationBreadcrumb />
      
      {/* Header Section */}
      <div className="flex flex-col items-start gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Recent Reviews
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            See what the community is drinking and reviewing
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading recent reviews...</p>
            </div>
          </div>
        }>
          <RecentReviews />
        </Suspense>
      </div>
    </div>
  )
} 