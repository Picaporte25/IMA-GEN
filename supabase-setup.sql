-- Supabase Database Setup for IMA-GEN
-- Execute this SQL in the Supabase SQL Editor to create the required tables

-- Create enum types
CREATE TYPE image_status AS ENUM ('generating', 'completed', 'failed');
CREATE TYPE transaction_type AS ENUM ('purchase', 'usage', 'refund');

-- Create table users
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table images
CREATE TABLE images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  style TEXT,
  width INTEGER,
  height INTEGER,
  number_of_images INTEGER DEFAULT 1,
  status image_status DEFAULT 'generating',
  image_urls TEXT[],
  credits_used INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table credit_transactions
CREATE TABLE credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type transaction_type NOT NULL,
  paddle_payment_id TEXT,
  paddle_checkout_id TEXT,
  image_id UUID REFERENCES images(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_images_user_id ON images(user_id);
CREATE INDEX idx_images_created_at ON images(created_at DESC);
CREATE INDEX idx_images_user_created ON images(user_id, created_at DESC);
CREATE INDEX idx_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX idx_transactions_user_created ON credit_transactions(user_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

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

-- Allow users to update their own images
CREATE POLICY "Users can update own images" ON images
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images" ON images
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Allow service role to insert images (for API operations)
CREATE POLICY "Service role can insert images" ON images
  FOR INSERT WITH CHECK (true);

-- Allow service role to update images (for status updates)
CREATE POLICY "Service role can update images" ON images
  FOR UPDATE USING (true) WITH CHECK (true);

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

-- Create a function to get current timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
