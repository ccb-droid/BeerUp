-- Add RLS policy to allow only admin users to update beers
-- This is needed for the admin page to update beer pricing, MOQ, and preorder status

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow authenticated users to update beers" ON beers;
DROP POLICY IF EXISTS "Allow admin users to update beers" ON beers;

-- Create policy to allow only admin users to update beers
CREATE POLICY "Allow admin users to update beers"
ON beers
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);
