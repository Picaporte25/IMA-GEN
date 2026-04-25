import { comparePassword, generateToken } from '@/lib/auth';
import { validateEmail, validatePassword, sanitizeInput } from '@/lib/validation';
import { supabaseAdmin } from '@/lib/db';
import { authRateLimit } from '@/lib/rateLimit';
import { setAuthCookie, applySecurityHeaders } from '@/lib/cookies';
import { secureLog, secureError, auditLog, maskEmail } from '@/lib/logger';

export default async function handler(req, res) {
  // Apply rate limiting
  const rateLimitResult = await new Promise((resolve) => {
    authRateLimit(req, res, () => resolve({ limited: false }));
  });

  if (res.statusCode === 429) {
    return; // Rate limit response already sent
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ error: emailValidation.error });
    }

    // Validate password (basic check - don't reveal complexity requirements on login)
    if (!password || typeof password !== 'string' || password.length < 1) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Sanitize email input
    const sanitizedEmail = sanitizeInput(emailValidation.email);

    // Find user using sanitized email
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', sanitizedEmail)
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

    secureLog('Login successful', { email: maskEmail(user.email) });
    auditLog('USER_LOGIN', user.id, { email: maskEmail(user.email) });

    // Set secure cookie
    console.log('🍪 Setting auth cookie');
    const cookieString = setAuthCookie(res, token);
    console.log('🍪 Cookie set:', cookieString.substring(0, 100) + '...');

    // Apply security headers
    applySecurityHeaders(res);

    return res.status(200).json({
      message: 'Login successful',
      token: token, // Include token for fallback (localStorage)
      user: {
        id: user.id,
        email: user.email,
        credits: user.credits,
      },
    });
  } catch (error) {
    secureError('Login error', error);
    res.status(500).json({ error: 'Failed to login' });
  }
}
