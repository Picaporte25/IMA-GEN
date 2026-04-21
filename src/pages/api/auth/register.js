import { hashPassword, generateToken } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

// Create service role client directly in the API route
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabaseServiceClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔵 Registration attempt started');
    const { email, password } = req.body;
    console.log('🔵 Received email:', email);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('🔵 Service client created:', !!supabaseServiceClient);
    console.log('🔵 Supabase URL:', supabaseUrl);

    // Check if user already exists
    console.log('🔵 Checking if user exists...');
    const { data: existingUser, error: checkError } = await supabaseServiceClient
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    console.log('🔵 Existing user check - data:', existingUser, 'error:', checkError);

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    console.log('🔵 Hashing password...');
    const hashedPassword = await hashPassword(password);
    console.log('🔵 Password hashed successfully');

    // Create user with free credits - bypass RLS
    console.log('🔵 Creating new user with service role...');
    const { data: newUser, error: createError } = await supabaseServiceClient
      .rpc('create_user', {
        p_email: email,
        p_password: hashedPassword,
        p_credits: 10
      });

    console.log('🔵 User creation via RPC - data:', newUser, 'error:', createError);

    if (createError) {
      // Try direct insert as fallback
      console.log('🔵 RPC failed, trying direct insert...');
      const { data: newUser2, error: directError } = await supabaseServiceClient
        .from('users')
        .insert({
          email,
          password: hashedPassword,
          credits: 10
        })
        .select()
        .single();

      console.log('🔵 Direct insert - data:', newUser2, 'error:', directError);

      if (directError) {
        throw directError;
      }

      // Generate token with successful insert
      const token = generateToken(newUser2);
      res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`);

      return res.status(201).json({
        message: 'User created successfully',
        user: {
          id: newUser2.id,
          email: newUser2.email,
          credits: newUser2.credits,
        },
      });
    }

    // Generate token with successful RPC
    const token = generateToken(newUser);
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`);

    console.log('🔵 Registration successful for:', email);
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        credits: newUser.credits,
      },
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('❌ Error details:', error.message, error.code, error.hint);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
}
