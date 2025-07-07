-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT UNIQUE, -- User's phone number for matching
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WebAuthn credentials for biometric authentication
CREATE TABLE webauthn_credentials (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  device_type TEXT,
  backed_up BOOLEAN DEFAULT false,
  transports TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts table (stores uploaded contacts)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_phone_hash TEXT NOT NULL, -- Hashed for privacy
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, contact_phone_hash)
);

-- Interests table (who likes whom)
CREATE TABLE interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interested_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_phone_hash TEXT NOT NULL, -- Hash of the person they're interested in
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(interested_user_id, target_phone_hash)
);

-- Matches view (mutual interests)
-- This finds mutual interests by checking if two users have each other's phone numbers
-- and both have marked interest in those phone numbers
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

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE webauthn_credentials ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- WebAuthn credentials policies
CREATE POLICY "Users can view own credentials" 
  ON webauthn_credentials FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credentials" 
  ON webauthn_credentials FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credentials" 
  ON webauthn_credentials FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own credentials" 
  ON webauthn_credentials FOR DELETE 
  USING (auth.uid() = user_id);

-- Contacts policies
CREATE POLICY "Users can view own contacts" 
  ON contacts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts" 
  ON contacts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts" 
  ON contacts FOR DELETE 
  USING (auth.uid() = user_id);

-- Interests policies
CREATE POLICY "Users can view own interests" 
  ON interests FOR SELECT 
  USING (auth.uid() = interested_user_id);

CREATE POLICY "Users can insert own interests" 
  ON interests FOR INSERT 
  WITH CHECK (auth.uid() = interested_user_id);

CREATE POLICY "Users can delete own interests" 
  ON interests FOR DELETE 
  USING (auth.uid() = interested_user_id);

-- Functions
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

-- Indexes for performance
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_phone_hash ON contacts(contact_phone_hash);
CREATE INDEX idx_interests_user_id ON interests(interested_user_id);
CREATE INDEX idx_interests_target_hash ON interests(target_phone_hash);
CREATE INDEX idx_webauthn_user_id ON webauthn_credentials(user_id);
CREATE INDEX idx_profiles_phone ON profiles(phone_number); 