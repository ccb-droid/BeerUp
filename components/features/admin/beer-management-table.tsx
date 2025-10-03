"use client"

import { useState, useCallback } from "react"
import { Beer } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { updateBeerPricing } from "@/lib/actions/beers"
import { Search, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useDebouncedCallback } from "use-debounce"

interface BeerManagementTableProps {
  beers: Beer[]
}

export function BeerManagementTable({ beers }: BeerManagementTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [preorderStates, setPreorderStates] = useState<Record<string, boolean>>({})
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({})

  const handleUpdate = useCallback(async (beerId: string, field: 'price' | 'moq' | 'preorder', value: number | boolean | null) => {
    const beer = beers.find(b => b.id === beerId)
    if (!beer) return

    const updateData = {
      price: field === 'price' ? value as number | null : beer.price,
      moq: field === 'moq' ? value as number : beer.moq || 1,
      preorder: field === 'preorder' ? value as boolean : beer.preorder || false,
    }

    setSavingStates(prev => ({ ...prev, [`${beerId}-${field}`]: true }))
    await updateBeerPricing(beerId, updateData)
    router.refresh()

    // Show saved checkmark briefly
    setTimeout(() => {
      setSavingStates(prev => ({ ...prev, [`${beerId}-${field}`]: false }))
    }, 1000)
  }, [beers, router])

  const handlePreorderToggle = async (beerId: string, checked: boolean) => {
    setPreorderStates(prev => ({ ...prev, [beerId]: checked }))
    await handleUpdate(beerId, 'preorder', checked)
  }

  const debouncedUpdate = useDebouncedCallback(handleUpdate, 500)

  const filteredBeers = beers.filter(beer =>
    beer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    beer.brewery.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by beer name or brewery..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Beer Name</TableHead>
              <TableHead>Brewery</TableHead>
              <TableHead className="w-[120px]">Price ($)</TableHead>
              <TableHead className="w-[100px]">MOQ</TableHead>
              <TableHead className="w-[120px]">Preorder</TableHead>
              <TableHead className="w-[120px]">Orders</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBeers.map((beer) => {
              const imageUrl = beer.image_url || "/placeholder.svg?height=50&width=50"

              return (
                <TableRow key={beer.id}>
                  <TableCell>
                    <div className="relative h-12 w-12">
                      <Image
                        src={imageUrl}
                        alt={beer.name}
                        fill
                        className="object-cover rounded"
                        sizes="50px"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{beer.name}</TableCell>
                  <TableCell>{beer.brewery}</TableCell>
                  <TableCell>
                    <div className="relative">
                      <Input
                        type="text"
                        inputMode="decimal"
                        defaultValue={beer.price?.toFixed(2) || ""}
                        onBlur={(e) => {
                          const value = e.target.value ? parseFloat(e.target.value) : null
                          if (value !== null && !isNaN(value)) {
                            e.target.value = value.toFixed(2)
                            debouncedUpdate(beer.id, 'price', value)
                          }
                        }}
                        className="w-full"
                        placeholder="0.00"
                      />
                      {savingStates[`${beer.id}-price`] && (
                        <Check className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 animate-in fade-in" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        defaultValue={beer.moq?.toString() || "1"}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1
                          debouncedUpdate(beer.id, 'moq', value)
                        }}
                        className="w-full"
                      />
                      {savingStates[`${beer.id}-moq`] && (
                        <Check className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 animate-in fade-in" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={preorderStates[beer.id] ?? beer.preorder ?? false}
                      onCheckedChange={(checked) => handlePreorderToggle(beer.id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">0</span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
