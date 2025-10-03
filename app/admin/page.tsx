import { getAllBeers } from "@/lib/actions/beers"
import { BeerManagementTable } from "@/components/features/admin/beer-management-table"
import { isAdmin } from "@/lib/auth/admin"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const adminAccess = await isAdmin()

  if (!adminAccess) {
    redirect("/")
  }

  const beers = await getAllBeers()

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col items-start gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Beer Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage beer preorders, pricing, and minimum order quantities
          </p>
        </div>
      </div>

      <div className="w-full">
        <BeerManagementTable beers={beers} />
      </div>
    </div>
  )
}
