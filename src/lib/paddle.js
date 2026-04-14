const PADDLE_CLIENT_SIDE_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_SIDE_TOKEN;
const PADDLE_API_KEY = process.env.PADDLE_API_KEY;

export async function createPaddleCheckout(priceId, userId, userEmail) {
  try {
    const response = await fetch('https://api.paddle.com/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PADDLE_API_KEY}`,
      },
      body: JSON.stringify({
        items: [
          {
            price_id: priceId,
            quantity: 1,
          }
        ],
        customer_email: userEmail,
        metadata: {
          user_id: userId,
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/cancel`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Paddle checkout error:', error);
    throw error;
  }
}

export function calculateEstimatedImages(credits) {
  // Standard 1024x1024 images cost 1 credit each
  return Math.floor(credits);
}

export const CREDIT_PACKAGES = [
  {
    id: 'price_starter_10',
    name: 'Starter',
    credits: 10,
    price: 2,
  },
  {
    id: 'price_basic_50',
    name: 'Basic',
    credits: 50,
    price: 8,
  },
  {
    id: 'price_pro_100',
    name: 'Pro',
    credits: 100,
    price: 15,
  },
  {
    id: 'price_creator_250',
    name: 'Creator',
    credits: 250,
    price: 35,
  },
  {
    id: 'price_studio_500',
    name: 'Studio',
    credits: 500,
    price: 65,
  },
  {
    id: 'price_enterprise_1000',
    name: 'Enterprise',
    credits: 1000,
    price: 120,
  },
];

export function getPackageById(id) {
  return CREDIT_PACKAGES.find(pkg => pkg.id === id);
}
