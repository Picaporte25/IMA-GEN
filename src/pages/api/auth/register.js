import { hashPassword, generateToken } from '@/lib/auth';
import { validateEmail, validatePassword, sanitizeInput } from '@/lib/validation';
import { createClient } from '@supabase/supabase-js';
import { authRateLimit } from '@/lib/rateLimit';
import { setAuthCookie, applySecurityHeaders } from '@/lib/cookies';
import { secureLog, secureError, auditLog, maskEmail, maskUserId, securityLog } from '@/lib/logger';

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
    secureLog('Registration attempt started', { email: maskEmail(email) });

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      securityLog('REGISTRATION_FAILED', 'WARN', { reason: 'invalid_email', email: maskEmail(email) });
      return res.status(400).json({ error: emailValidation.error });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      securityLog('REGISTRATION_FAILED', 'WARN', { reason: 'invalid_password', email: maskEmail(email) });
      return res.status(400).json({ error: passwordValidation.error });
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(emailValidation.email);
    const sanitizedPassword = password; // Don't sanitize password - we need the original for hashing

    secureLog('Processing registration', { email: maskEmail(sanitizedEmail) });

    secureLog('Service client initialized', { hasClient: !!supabaseServiceClient });

    // Check if user already exists
    secureLog('Checking for existing user', { email: maskEmail(sanitizedEmail) });
    const { data: existingUser, error: checkError } = await supabaseServiceClient
      .from('users')
      .select('id')
      .eq('email', sanitizedEmail)
      .single();

    if (existingUser) {
      securityLog('REGISTRATION_FAILED', 'INFO', { reason: 'user_exists', email: maskEmail(sanitizedEmail) });
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    secureLog('Hashing password');
    const hashedPassword = await hashPassword(password);
    secureLog('Password hashed successfully');

    // Create user with 1 free credit for trial - bypass RLS
    secureLog('Creating new user with service role', { email: maskEmail(sanitizedEmail) });
    const { data: newUser, error: createError } = await supabaseServiceClient
      .rpc('create_user', {
        p_email: sanitizedEmail,
        p_password: hashedPassword,
        p_credits: 1
      });

    if (createError) {
      // Try direct insert as fallback
      secureLog('RPC failed, trying direct insert');
      const { data: newUser2, error: directError } = await supabaseServiceClient
        .from('users')
        .insert({
          email: sanitizedEmail,
          password: hashedPassword,
          credits: 1
        })
        .select()
        .single();

      if (directError) {
        secureError('User creation failed', directError);
        throw directError;
      }

      // Generate token with successful insert
      const token = generateToken(newUser2);
      setAuthCookie(res, token);
      applySecurityHeaders(res);

      auditLog('USER_REGISTERED', newUser2.id, { email: maskEmail(newUser2.email) });
      secureLog('Registration successful', { userId: maskUserId(newUser2.id) });

      return res.status(201).json({
        message: 'User created successfully',
        token: token, // Include token for fallback
        user: {
          id: newUser2.id,
          email: newUser2.email,
          credits: newUser2.credits,
        },
      });
    }

    // Generate token with successful RPC
    const token = generateToken(newUser);
    setAuthCookie(res, token);
    applySecurityHeaders(res);

    auditLog('USER_REGISTERED', newUser.id, { email: maskEmail(newUser.email) });
    secureLog('Registration successful', { userId: maskUserId(newUser.id) });
    res.status(201).json({
      message: 'User created successfully',
      token: token, // Include token for fallback
      user: {
        id: newUser.id,
        email: newUser.email,
        credits: newUser.credits,
      },
    });
  } catch (error) {
    secureError('Registration error', error);
    securityLog('REGISTRATION_ERROR', 'ERROR', { error: error.message });
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
}
