import { getUserFromToken } from '@/lib/auth';
import { createPaddleCheckout, CREDIT_PACKAGES } from '@/lib/paddle';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { plan } = req.body;

    const packageData = CREDIT_PACKAGES.find(pkg => pkg.name.toLowerCase() === plan.toLowerCase());

    if (!packageData) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const checkout = await createPaddleCheckout(
      packageData.id,
      user.id,
      user.email
    );

    res.status(200).json({
      checkout_url: checkout.checkout_url,
      checkout_id: checkout.id,
    });
  } catch (error) {
    console.error('Paddle checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout' });
  }
}
