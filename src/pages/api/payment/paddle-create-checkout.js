import { getUserFromToken } from '@/lib/auth';
import { createPaddleCheckout, CREDIT_PACKAGES } from '@/lib/paddle';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🛒 Paddle checkout request received');
    console.log('🍪 Cookies:', req.cookies ? 'Present' : 'Missing');
    console.log('🔑 Auth header:', req.headers.authorization ? 'Present' : 'Missing');

    const user = await getUserFromToken(req);

    if (!user) {
      console.log('❌ No user found from token');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('✅ User authenticated:', user.email);

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
    res.status(500).json({ error: 'Failed to create checkout' });
  }
}
