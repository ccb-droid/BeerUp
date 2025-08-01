-- Add preorder column to beers table
ALTER TABLE public.beers 
ADD COLUMN preorder BOOLEAN DEFAULT FALSE NOT NULL;

-- Optional: Update existing beers to have preorder=TRUE if needed
-- UPDATE public.beers SET preorder = TRUE WHERE id IN ('specific_beer_ids');

-- Optional: Create an index for better query performance
CREATE INDEX idx_beers_preorder ON public.beers(preorder);