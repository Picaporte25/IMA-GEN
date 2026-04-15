import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { getUserFromToken } from '@/lib/auth';
import { createPaddleCheckout, CREDIT_PACKAGES } from '@/lib/paddle';

export default function Checkout({ user, credits, plan }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const packageData = CREDIT_PACKAGES.find(pkg => pkg.name.toLowerCase() === plan?.toLowerCase());

  useEffect(() => {
    if (user && packageData) {
      initiateCheckout();
    }
  }, [user, packageData]);

  const initiateCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payment/paddle-create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: packageData.name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      // Redirect to Paddle checkout
      window.location.href = data.checkout_url;
    } catch (err) {
      setError(err.message || 'Failed to create checkout');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout title="Checkout - IMA-GEN" user={user} credits={credits}>
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="card-glass text-center py-20">
            <h2 className="text-2xl font-bold mb-4 text-neon">Please Login First</h2>
            <p className="text-text-secondary mb-6">You need to be logged in to purchase credits.</p>
            <a href="/login" className="btn-primary">Go to Login</a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Checkout - IMA-GEN" user={user} credits={credits}>
      <div className="max-w-4xl mx-auto px-4 py-20">
        {loading ? (
          <div className="card-glass text-center py-20">
            <div className="spinner-futuristic mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4 text-neon">Preparing Your Checkout</h2>
            <p className="text-text-secondary">Redirecting to secure payment...</p>
          </div>
        ) : error ? (
          <div className="card-glass text-center py-20">
            <div className="text-status-error mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-neon">Checkout Failed</h2>
            <p className="text-text-secondary mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button onClick={initiateCheckout} className="btn-primary">Try Again</button>
              <a href="/pricing" className="btn-outline">Back to Pricing</a>
            </div>
          </div>
        ) : (
          <div className="card-glass text-center py-20">
            <h2 className="text-2xl font-bold mb-4 text-neon">Processing Your Request</h2>
            <p className="text-text-secondary">Please wait...</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const user = await getUserFromToken(context);
  const { plan } = context.query;

  return {
    props: {
      user,
      credits: user?.credits || 0,
      plan: plan || null,
    },
  };
}
