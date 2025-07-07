-- Migration to update from phone-based auth to email+phone auth
-- Run this if you already created the tables with the old schema

-- 1. Update profiles table
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
  ALTER COLUMN phone_number DROP NOT NULL,
  ADD CONSTRAINT profiles_email_not_null CHECK (email IS NOT NULL);

-- 2. Add the new profile insert policy if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" 
      ON profiles FOR INSERT 
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 3. Drop and recreate the matches view with updated logic
DROP VIEW IF EXISTS matches;

CREATE OR REPLACE VIEW matches AS
WITH mutual_interests AS (
  SELECT 
    i1.interested_user_id as user1_id,
    i2.interested_user_id as user2_id,
    GREATEST(i1.created_at, i2.created_at) as matched_at
  FROM interests i1
  JOIN profiles p1 ON p1.id = i1.interested_user_id
  JOIN profiles p2 ON p2.phone_number IS NOT NULL
  JOIN interests i2 ON 
    i2.interested_user_id = p2.id AND
    i1.target_phone_hash = MD5(p2.phone_number) AND
    i2.target_phone_hash = MD5(p1.phone_number)
  WHERE i1.interested_user_id < i2.interested_user_id
)
SELECT 
  mi.user1_id,
  p1.phone_number as user1_phone,
  p1.email as user1_email,
  p1.display_name as user1_name,
  mi.user2_id,
  p2.phone_number as user2_phone,
  p2.email as user2_email,
  p2.display_name as user2_name,
  mi.matched_at
FROM mutual_interests mi
JOIN profiles p1 ON p1.id = mi.user1_id
JOIN profiles p2 ON p2.id = mi.user2_id;

-- 4. Update the get_mutual_interests function
CREATE OR REPLACE FUNCTION get_mutual_interests(user_id UUID)
RETURNS TABLE(
  contact_id UUID,
  contact_name TEXT,
  contact_phone TEXT,
  matched_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH user_profile AS (
    SELECT phone_number FROM profiles WHERE id = user_id
  ),
  mutual_matches AS (
    SELECT 
      CASE 
        WHEN m.user1_id = user_id THEN m.user2_id 
        ELSE m.user1_id 
      END as matched_user_id,
      CASE 
        WHEN m.user1_id = user_id THEN m.user2_phone 
        ELSE m.user1_phone 
      END as matched_phone,
      m.matched_at
    FROM matches m
    WHERE m.user1_id = user_id OR m.user2_id = user_id
  )
  SELECT 
    c.id,
    c.contact_name,
    c.contact_phone,
    mm.matched_at
  FROM mutual_matches mm
  JOIN contacts c ON 
    c.user_id = user_id AND 
    c.contact_phone = mm.matched_phone;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Add index for phone number lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone_number);

-- Note: The webauthn_credentials table in the schema is not needed 
-- for the current email+phone implementation, so we're not creating it 