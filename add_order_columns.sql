-- Add price and moq columns to beers table
ALTER TABLE beers
ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS moq INTEGER DEFAULT 1;

-- Add payment_confirmed column to waitlist table
ALTER TABLE waitlist
ADD COLUMN IF NOT EXISTS payment_confirmed BOOLEAN DEFAULT FALSE;

-- Update existing beers with default values if needed
-- You can customize these values as needed
COMMENT ON COLUMN beers.price IS 'Price per unit in SGD';
COMMENT ON COLUMN beers.moq IS 'Minimum order quantity';
COMMENT ON COLUMN waitlist.payment_confirmed IS 'Whether the user has confirmed payment';
