import { getUserFromToken } from '@/lib/auth';
import { createPaddleCheckout, CREDIT_PACKAGES } from '@/lib/paddle';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🛒 Paddle checkout request received');
    console.log('🍪 Cookies:', req.cookies ? JSON.stringify(Object.keys(req.cookies)) : 'Missing');
    console.log('🔑 Auth header:', req.headers.authorization ? req.headers.authorization.substring(0, 50) + '...' : 'Missing');
    console.log('📋 Request body:', req.body);

    const user = await getUserFromToken(req);

    if (!user) {
      console.log('❌ No user found from token');

      // Try to get more diagnostic information
      const authDiagnosis = {
        hasCookies: !!req.cookies,
        cookieKeys: req.cookies ? Object.keys(req.cookies) : [],
        cookieValues: req.cookies ? Object.fromEntries(Object.entries(req.cookies).map(([k, v]) => [k, v ? v.substring(0, 20) + '...' : null])) : {},
        hasAuthHeader: !!req.headers.authorization,
        authHeaderPrefix: req.headers.authorization ? req.headers.authorization.substring(0, 50) + '...' : null,
        authHeaderLength: req.headers.authorization ? req.headers.authorization.length : 0,
        hasCookieHeader: !!req.headers.cookie,
        cookieHeaderLength: req.headers.cookie ? req.headers.cookie.length : 0,
        cookieHeaderPreview: req.headers.cookie ? req.headers.cookie.substring(0, 100) + '...' : null,
        timestamp: new Date().toISOString()
      };

      console.log('🔍 Authentication diagnosis:', JSON.stringify(authDiagnosis, null, 2));

      return res.status(401).json({
        error: 'Unauthorized',
        diagnosis: authDiagnosis,
        message: 'Could not authenticate user. Please try logging in again.'
      });
    }

    console.log('✅ User authenticated:', user.email, 'ID:', user.id);

    const { plan } = req.body;

    console.log('📦 Requested plan:', plan);

    const packageData = CREDIT_PACKAGES.find(pkg => pkg.name.toLowerCase() === plan.toLowerCase());

    if (!packageData) {
      console.log('❌ Invalid plan:', plan);
      return res.status(400).json({ error: 'Invalid plan' });
    }

    console.log('✅ Package found:', packageData.name, 'ID:', packageData.id);

    const checkout = await createPaddleCheckout(
      packageData.id,
      user.id,
      user.email
    );

    console.log('✅ Paddle checkout created:', checkout.id);

    res.status(200).json({
      checkout_url: checkout.checkout_url,
      checkout_id: checkout.id,
    });
  } catch (error) {
    console.error('❌ Paddle checkout error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to create checkout',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
