import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getBeers, getBeerById, addBeer, updateBeer, deleteBeer, searchBeers } from "@/lib/actions/beers"
import { BeerInput, BeerSearch } from "@/lib/validations/beer"

export function useBeers() {
  return useQuery({
    queryKey: ["beers"],
    queryFn: () => getBeers(),
  })
}

export function useBeerById(id: string) {
  return useQuery({
    queryKey: ["beer", id],
    queryFn: () => getBeerById(id),
    enabled: !!id,
  })
}

export function useSearchBeers(search: BeerSearch) {
  return useQuery({
    queryKey: ["beers", "search", search],
    queryFn: () => searchBeers(search.query),
    enabled: search.query.length > 0,
  })
}

export function useAddBeer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (beer: BeerInput) => addBeer(beer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beers"] })
    },
  })
}

export function useUpdateBeer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, beer }: { id: string; beer: Partial<BeerInput> }) => updateBeer(id, beer),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["beers"] })
      queryClient.invalidateQueries({ queryKey: ["beer", id] })
    },
  })
}

export function useDeleteBeer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => deleteBeer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beers"] })
    },
  })
} 