-- Create RPC function for user registration with initial credits
-- Execute this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION create_user(
  p_email TEXT,
  p_password TEXT,
  p_credits INTEGER DEFAULT 1
)
RETURNS users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert new user with specified credits
  INSERT INTO users (email, password, credits)
  VALUES (p_email, p_password, p_credits)
  RETURNING *;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION create_user TO service_role;
GRANT EXECUTE ON FUNCTION create_user TO authenticated;
