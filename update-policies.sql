-- Update Row Level Security Policies for IMA-GEN
-- Execute this to fix registration issues

-- Drop existing policies for users table
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Service role can update users" ON users;

-- Drop existing policies for images table
DROP POLICY IF EXISTS "Users can view own images" ON images;
DROP POLICY IF EXISTS "Users can insert own images" ON images;
DROP POLICY IF EXISTS "Users can update their own images" ON images;
DROP POLICY IF EXISTS "Users can delete own images" ON images;
DROP POLICY IF EXISTS "Service role can insert images" ON images;
DROP POLICY IF EXISTS "Service role can update images" ON images;
DROP POLICY IF EXISTS "Service role can delete images" ON images;

-- Drop existing policies for credit_transactions table
DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Service role can insert transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Service role can update transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Service role can delete transactions" ON credit_transactions;

-- Create policies for users table
-- Allow users to see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Allow service role to insert new users (for registration)
CREATE POLICY "Service role can insert users" ON users
  FOR INSERT WITH CHECK (true);

-- Allow service role to update users (for credit management)
CREATE POLICY "Service role can update users" ON users
  FOR UPDATE USING (true) WITH CHECK (true);

-- Create policies for images table
-- Allow users to view their own images
CREATE POLICY "Users can view own images" ON images
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Allow users to insert their own images
CREATE POLICY "Users can insert own images" ON images
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Allow service role to insert images (for API operations)
CREATE POLICY "Service role can insert images" ON images
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own images
CREATE POLICY "Users can update their own images" ON images
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Allow service role to update images (for status updates)
CREATE POLICY "Service role can update images" ON images
  FOR UPDATE USING (true) WITH CHECK (true);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images" ON images
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Allow service role to delete images (for cleanup)
CREATE POLICY "Service role can delete images" ON images
  FOR DELETE USING (true);

-- Create policies for credit_transactions table
-- Allow users to view their own transactions
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Allow service role to insert transactions (for purchases and usage)
CREATE POLICY "Service role can insert transactions" ON credit_transactions
  FOR INSERT WITH CHECK (true);

-- Allow service role to update transactions (for refunds)
CREATE POLICY "Service role can update transactions" ON credit_transactions
  FOR UPDATE USING (true) WITH CHECK (true);

-- Allow service role to delete transactions (for cleanup)
CREATE POLICY "Service role can delete transactions" ON credit_transactions
  FOR DELETE USING (true);
