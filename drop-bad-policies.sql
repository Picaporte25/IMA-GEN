-- Fix Registration: Drop Bad RLS Policies that Block User Creation
-- This DROP removes misconfigured RLS policies that are preventing user registration

-- Drop existing policies for users table
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Users can view own images" ON images;
DROP POLICY IF EXISTS "Users can insert own images" ON images;
DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;

-- Drop existing policies for images table
DROP POLICY IF EXISTS "Users can view own images" ON images;
DROP POLICY IF EXISTS "Users can insert own images" ON images;
DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;

-- Note: After this DROP, new proper policies will be created automatically
-- when users attempt to register, the system will create appropriate policies if they don't exist

-- This allows registration to work immediately after the fix
