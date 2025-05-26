"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SearchDebug() {
  const router = useRouter()

  useEffect(() => {
    // Log when navigation happens
    console.log("Search component mounted, router ready")
  }, [])

  const testNavigation = (beerId: string) => {
    console.log(`Testing navigation to: /reviews/${beerId}`)
    router.push(`/reviews/${beerId}`)
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-100 p-2 rounded text-xs">
      <p>Search Debug</p>
      <button onClick={() => testNavigation("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")} className="text-blue-600">
        Test Hazy Wonder
      </button>
      <br />
      <button onClick={() => testNavigation("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12")} className="text-blue-600">
        Test Guinness
      </button>
    </div>
  )
}
