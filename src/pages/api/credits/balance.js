import { getUserFromToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('💰 Credits balance request received');
    console.log('🍪 Cookies:', req.cookies ? JSON.stringify(Object.keys(req.cookies)) : 'Missing');
    console.log('🔑 Auth header:', req.headers.authorization ? req.headers.authorization.substring(0, 50) + '...' : 'Missing');

    const user = await getUserFromToken(req);

    if (!user) {
      console.log('❌ No user found from token');

      // Try to get more diagnostic information
      const authDiagnosis = {
        hasCookies: !!req.cookies,
        cookieKeys: req.cookies ? Object.keys(req.cookies) : [],
        hasAuthHeader: !!req.headers.authorization,
        authHeaderPrefix: req.headers.authorization ? req.headers.authorization.substring(0, 10) : null,
        hasCookieHeader: !!req.headers.cookie,
        cookieHeaderLength: req.headers.cookie ? req.headers.cookie.length : 0,
        timestamp: new Date().toISOString()
      };

      console.log('🔍 Authentication diagnosis:', JSON.stringify(authDiagnosis, null, 2));

      return res.status(401).json({
        error: 'Unauthorized',
        diagnosis: authDiagnosis,
        message: 'Could not authenticate user. Please try logging in again.'
      });
    }

    console.log('✅ User authenticated for credits:', user.email, 'ID:', user.id);

    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('❌ Error fetching user credits:', error);
      throw error;
    }

    console.log('✅ User credits:', userData.credits);

    res.status(200).json({ credits: userData.credits });
  } catch (error) {
    console.error('❌ Get credits error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to get credits',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
