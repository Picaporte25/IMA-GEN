import { comparePassword, generateToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    console.log('Login successful for user:', user.email);
    console.log('Generated token:', token.substring(0, 20) + '...');

    // Set cookie with better compatibility for development
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const cookieString = `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=${isDevelopment ? 'Lax' : 'Strict'}${isDevelopment ? '' : '; Secure'}`;
    console.log('Setting cookie:', cookieString.substring(0, 50) + '...');

    res.setHeader('Set-Cookie', [
      cookieString,
    ]);

    // Also return token in response for localStorage fallback
    return res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        credits: user.credits,
      },
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
}
