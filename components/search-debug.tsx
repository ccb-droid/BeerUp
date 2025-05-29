"use client"

import Link from "next/link"

export default function SearchDebug() {
  return (
    <div className="fixed bottom-4 left-4 bg-gray-100 p-2 rounded text-xs">
      <p>Search Debug</p>
      <Link href="/reviews/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" passHref>
        <button className="text-blue-600">Test Hazy Wonder</button>
      </Link>
      <br />
      <Link href="/reviews/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12" passHref>
        <button className="text-blue-600">Test Guinness</button>
      </Link>
    </div>
  )
}
