import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { getUserFromToken } from '@/lib/auth';
import { createPaddleCheckout, CREDIT_PACKAGES } from '@/lib/paddle';

export default function Checkout({ user, credits, plan }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(plan || null);
  const [authStatus, setAuthStatus] = useState('');

  const packageData = selectedPlan
    ? CREDIT_PACKAGES.find(pkg => pkg.name.toLowerCase() === selectedPlan.toLowerCase())
    : null;

  useEffect(() => {
    // Check authentication status on mount
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      console.log('🔍 Auth check on mount:');
      console.log('🔑 Token present:', !!token);
      console.log('👤 User present:', !!userStr);

      if (token) {
        console.log('🔑 Token length:', token.length);
        try {
          // Try to parse the token to see if it looks like a JWT
          const parts = token.split('.');
          console.log('🔑 Token parts:', parts.length);
          if (parts.length === 3) {
            console.log('🔑 Token looks like valid JWT');
            try {
              const payload = JSON.parse(atob(parts[1]));
              console.log('👤 Token payload:', payload);
              setAuthStatus(`Authenticated as ${payload.email}`);
            } catch (e) {
              console.error('❌ Error parsing token payload:', e);
              setAuthStatus('Invalid token format');
            }
          } else {
            console.log('❌ Token does not look like JWT');
            setAuthStatus('Invalid token format');
          }
        } catch (e) {
          console.error('❌ Error analyzing token:', e);
          setAuthStatus('Token analysis failed');
        }
      } else {
        setAuthStatus('No token found');
      }
    }

    if (user && packageData) {
      initiateCheckout();
    }
  }, [user, packageData]);

  const initiateCheckout = async () => {
    if (!packageData) return;

    setLoading(true);
    setError('');

    try {
      const headers = { 'Content-Type': 'application/json' };

      // Get token from multiple sources
      let token = null;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
        console.log('🔑 Token from localStorage:', token ? 'Found' : 'Not found');

        if (token) {
          console.log('🔑 Token length:', token.length);
          console.log('🔑 Token first 20 chars:', token.substring(0, 20) + '...');
          console.log('🔑 Token last 20 chars:', '...' + token.substring(token.length - 20));
        }
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('📤 Authorization header set:', headers['Authorization'].substring(0, 50) + '...');
      }

      console.log('📤 Initiating checkout for plan:', packageData.name);
      console.log('📤 Request headers:', headers);
      console.log('📤 Full request details:', {
        method: 'POST',
        url: '/api/payment/paddle-create-checkout',
        headers: headers,
        body: { plan: packageData.name }
      });

      const response = await fetch('/api/payment/paddle-create-checkout', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ plan: packageData.name }),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();

      console.log('📥 Response data:', data);

      if (!response.ok) {
        console.error('❌ Checkout error:', data);
        throw new Error(data.error || 'Failed to create checkout');
      }

      console.log('✅ Checkout successful, redirecting to:', data.checkout_url);

      // Redirect to Paddle checkout
      window.location.href = data.checkout_url;
    } catch (err) {
      console.error('❌ Checkout error:', err);
      console.error('❌ Error stack:', err.stack);
      setError(err.message || 'Failed to create checkout');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout title="Checkout - PixelAlchemy" user={user} credits={credits}>
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

  // Show pricing plans if no plan is selected
  if (!selectedPlan) {
    return (
      <Layout title="Choose Your Plan - PixelAlchemy" user={user} credits={credits}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-neon">
              Choose Your Credit Package
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Select the perfect package for your needs. No subscriptions, credits never expire.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CREDIT_PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                className="card-glass relative hover:border-violet-500/50 transition-all duration-300"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-text-primary mb-2">{pkg.name}</h3>
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-neon">{pkg.credits}</span>
                    <span className="text-text-secondary text-lg ml-1">credits</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-4">${pkg.price}</div>
                  <p className="text-text-muted text-sm">
                    ${(pkg.price / pkg.credits).toFixed(2)} per credit
                  </p>
                </div>

                <button
                  onClick={() => setSelectedPlan(pkg.name)}
                  className="w-full py-3 rounded-lg font-semibold transition-all btn-primary"
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Checkout - PixelAlchemy" user={user} credits={credits}>
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
              <button onClick={() => setSelectedPlan(null)} className="btn-outline">Back to Plans</button>
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
