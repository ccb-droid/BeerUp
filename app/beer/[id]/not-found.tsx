import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function BeerNotFound() {
  return (
    <div className="container max-w-4xl py-20 text-center">
      <h1 className="text-3xl font-bold mb-4">Beer Not Found</h1>
      <p className="text-muted-foreground mb-8">
        Sorry, we couldn't find the beer you're looking for. It may have been removed or doesn't exist.
      </p>
      <Button asChild>
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  )
} 