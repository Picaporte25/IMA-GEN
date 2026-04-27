import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ElegantImageGenerator from '@/components/ElegantImageGenerator';
import { authFetch } from '@/lib/api';
import { BEFORE_AFTER_EXAMPLES } from '@/lib/nanoBanana';

export default function Home() {
  // Initialize with null - we'll fetch from API
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't clear localStorage - let the auth system handle it
    // if (typeof window !== 'undefined') {
    //   localStorage.removeItem('token');
    //   localStorage.removeItem('user');
    // }

    async function loadUser() {
      try {
        // First, try to get user from localStorage (fastest method)
        let localUser = null;
        let localToken = null;

        if (typeof window !== 'undefined') {
          const userStr = localStorage.getItem('user');
          const tokenStr = localStorage.getItem('token');

          if (userStr) {
            try {
              localUser = JSON.parse(userStr);
            } catch (e) {
              console.error('Error parsing user from localStorage:', e);
            }
          }

          if (tokenStr) {
            localToken = tokenStr;
          }
        }

        // If we have local user, use it immediately and update in background
        if (localUser) {
          console.log('✅ Using user from localStorage:', localUser.email);
          setUser(localUser);

          // Try to get fresh credits from API
          const token = localToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
          const headers = { 'Content-Type': 'application/json' };

          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          try {
            const creditsResponse = await fetch('/api/credits/balance', {
              method: 'GET',
              headers,
              credentials: 'include',
            });

            if (creditsResponse.ok) {
              const creditsData = await creditsResponse.json();
              console.log('✅ Credits from API:', creditsData.credits);
              setCredits(creditsData.credits);

              // Update local user with fresh credits
              if (localUser) {
                localUser.credits = creditsData.credits;
                localStorage.setItem('user', JSON.stringify(localUser));
                setUser(localUser);
              }
            } else {
              // If API fails, use credits from localStorage user
              console.log('⚠️ API failed, using local credits:', localUser.credits);
              setCredits(localUser.credits || 0);
            }
          } catch (error) {
            console.error('❌ Error fetching credits:', error);
            // Use local credits as fallback
            setCredits(localUser.credits || 0);
          }

          setLoading(false);
          return;
        }

        // If no local user, try API verification
        console.log('🔍 No local user, trying API verification...');
        const userResponse = await authFetch('/api/auth/verify');

        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('✅ User from API:', userData.user.email);
          setUser(userData.user);

          // Store in localStorage for persistence
          if (typeof window !== 'undefined' && userData.user) {
            localStorage.setItem('user', JSON.stringify(userData.user));
          }

          const creditsResponse = await authFetch('/api/credits/balance');
          if (creditsResponse.ok) {
            const creditsData = await creditsResponse.json();
            setCredits(creditsData.credits);
          }
        } else {
          // API failed - user is not authenticated
          console.log('❌ API verification failed');
          setUser(null);
          setCredits(0);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        setUser(null);
        setCredits(0);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const handleCreditUpdate = (newCredits) => {
    setCredits(newCredits);
  };

  useEffect(() => {
    if (user) {
      const interval = setInterval(async () => {
        try {
          const response = await authFetch('/api/credits/balance');
          const data = await response.json();
          setCredits(data.credits);
        } catch (error) {
          console.error('Failed to fetch credits:', error);
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const scrollToGenerator = () => {
    document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Layout
        title="Loading..."
        description="Loading..."
        user={user || null}
        credits={credits || 0}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="spinner-large" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="PixelAlchemy | AI-Powered Image Generation for Creatives"
      description="Leading artificial intelligence platform for real estate property transformation. Generate professional images, perform automated virtual staging, and create interior designs in seconds. Ideal for real estate agents, interior designers, and property developers."
      keywords="AI property transformation, virtual staging intelligence, interior design artificial intelligence, professional real estate images, real estate AI tools, automated property staging, interior design AI, real estate photography enhancement, property visualization software"
      user={user}
      credits={credits}
    >
      {/* Hero Section - SEO Optimized */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-gray-900 to-orange-900/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-violet-400 to-purple-400 tracking-tight">
            Revolutionize Your Real Estate Business with Artificial Intelligence
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto font-light leading-relaxed">
            Professional property transformation platform that increases <span className="text-violet-400 font-semibold">listing conversion rates by up to 300%</span> through AI-generated, photorealistic images.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={scrollToGenerator}
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium rounded-full transition-all duration-300 shadow-lg shadow-violet-900/30 hover:shadow-violet-900/50 text-lg"
            >
              Start Creating
            </button>
            <a
              href="#benefits"
              className="px-8 py-4 border border-white/20 hover:border-white/40 text-white font-medium rounded-full transition-all duration-300 text-lg"
            >
              View Benefits
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">+300%</div>
              <div className="text-sm text-gray-400">Higher Conversions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">85%</div>
              <div className="text-sm text-gray-400">Cost Savings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">10s</div>
              <div className="text-sm text-gray-400">Per Image</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-sm text-gray-400">Availability</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Problem/Solution Section - SEO Heavy */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">
              The Real Estate Challenges We Solve
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              Real estate professionals face constant challenges: vacant properties that don't sell, high costs of physical staging, and the need for professional images to stand out in competitive markets.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-900/20 rounded-2xl p-8 border border-red-500/30">
              <h3 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Without PixelAlchemy
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-red-400 mt-1">✗</span>
                  <span><strong>Expensive physical staging:</strong> $2,000 - $10,000 USD per property</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-red-400 mt-1">✗</span>
                  <span><strong>Long wait times:</strong> Days or weeks for professional photography</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-red-400 mt-1">✗</span>
                  <span><strong>Limited creativity:</strong> Dependent on decorator availability</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-red-400 mt-1">✗</span>
                  <span><strong>Vacant properties:</strong> Lower perceived value, longer market time</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-red-400 mt-1">✗</span>
                  <span><strong>Recurring costs:</strong> New photos needed for every design change</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-900/20 rounded-2xl p-8 border border-green-500/30">
              <h3 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                With PixelAlchemy
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-green-400 mt-1">✓</span>
                  <span><strong>Affordable virtual staging:</strong> $0.10 - $1.00 USD per image</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-green-400 mt-1">✓</span>
                  <span><strong>Instant results:</strong> Less than 30 seconds per image</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-green-400 mt-1">✓</span>
                  <span><strong>Unlimited creativity:</strong> Hundreds of styles and combinations</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-green-400 mt-1">✓</span>
                  <span><strong>Attractive properties:</strong> Higher perceived value, faster sales</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-green-400 mt-1">✓</span>
                  <span><strong>Fixed costs:</strong> Monthly plans with no surprises</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Solutions - Strategic SEO Section */}
      <section id="benefits" className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">
              Solutions by Industry
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              Discover how real estate professionals across different sectors are transforming their operations with our AI platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Real Estate Agents */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-violet-500/30 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Real Estate Agents</h3>
                  <p className="text-gray-400 text-sm">Increase property valuation and sales</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Increased Perceived Value</h4>
                    <p className="text-gray-400 text-sm">Transform vacant properties into furnished spaces that increase perceived value by up to 20% for buyers.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Reduced Market Time</h4>
                    <p className="text-gray-400 text-sm">Listings with virtual staging sell 73% faster than vacant properties.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">ROI Maximization</h4>
                    <p className="text-gray-400 text-sm">Minimal investment with up to 10x return in higher property value and commissions.</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs">+300% engagement</span>
                  <span className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs">-40% market time</span>
                  <span className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs">+15% offer value</span>
                </div>
              </div>
            </div>

            {/* Interior Designers */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-violet-500/30 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Interior Designers</h3>
                  <p className="text-gray-400 text-sm">Rapid prototyping and impressive presentations</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Instant Prototyping</h4>
                    <p className="text-gray-400 text-sm">Generate multiple design concepts in seconds instead of days of traditional 3D rendering.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Client Presentations</h4>
                    <p className="text-gray-400 text-sm">Show style variations to clients before starting real projects, reducing costly changes.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Expandable Portfolio</h4>
                    <p className="text-gray-400 text-sm">Create conceptual projects for your portfolio without needing physical spaces.</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs">-90% design time</span>
                  <span className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs">-75% prototyping costs</span>
                  <span className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs">+200% projects</span>
                </div>
              </div>
            </div>

            {/* Property Developers */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-violet-500/30 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Property Developers</h3>
                  <p className="text-gray-400 text-sm">Pre-sales and marketing for construction projects</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Project Visualization</h4>
                    <p className="text-gray-400 text-sm">Generate photorealistic renders of unfinished units to start pre-sales with competitive advantage.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Pre-sales Marketing</h4>
                    <p className="text-gray-400 text-sm">Impactful marketing materials with multiple furnishing configurations for each unit type.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Market Segmentation</h4>
                    <p className="text-gray-400 text-sm">Create different versions of the same space to segment markets (family, singles, investors).</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs">+50% pre-sale speed</span>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs">-80% render costs</span>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs">+35% pre-sale value</span>
                </div>
              </div>
            </div>

            {/* Property Photographers */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-violet-500/30 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Property Photographers</h3>
                  <p className="text-gray-400 text-sm">Expand services and increase revenue</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Premium Add-on Services</h4>
                    <p className="text-gray-400 text-sm">Offer complete packages: professional photography + virtual staging as high-value service.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Faster Deliveries</h4>
                    <p className="text-gray-400 text-sm">Reduce complete project delivery time from days to hours, increasing your work capacity.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Competitive Differentiation</h4>
                    <p className="text-gray-400 text-sm">Stand out in a saturated market by offering services most photographers don't provide.</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs">+60% revenue/client</span>
                  <span className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs">-70% delivery time</span>
                  <span className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs">+3 clients/month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Examples - Social Proof */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-white">
              Real Transformations, Measurable Results
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              Examples of how our artificial intelligence transforms vacant properties into attractive spaces that generate immediate interest
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Large Before/After Comparison */}
            <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-violet-500/30 transition-all duration-500 group">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative bg-gray-900 aspect-[4/3]">
                  <img
                    src="/examples/before-after/Before.jpeg"
                    alt="Vacant space before transformation"
                    className="w-full h-full object-cover scale-85"
                  />
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <span className="text-sm font-medium text-white/80">Before</span>
                  </div>
                </div>
                <div className="relative bg-gray-900 aspect-[4/3]">
                  <img
                    src="/examples/before-after/After.png"
                    alt="Space transformed with AI"
                    className="w-full h-full object-cover scale-85"
                  />
                  <div className="absolute top-4 right-4 bg-green-600/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <span className="text-sm font-medium text-white">After</span>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <h3 className="font-semibold text-white text-2xl mb-3">Professional Room Transformation</h3>
                  <p className="text-gray-400 mb-4">Transform any living space with AI-powered design. Change furniture colors, materials, and atmosphere to match your vision.</p>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Custom AI Prompt Example
                  </h4>
                  <p className="text-gray-300 italic leading-relaxed">
                    "Transform this living space by changing the furniture to black, adding warm wood elements, abundant plants, and maintaining architectural details. Professional quality with natural lighting."
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-green-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">AI-generated transformation</span>
                  </div>
                  <div className="flex items-center gap-2 text-orange-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">15 seconds</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-violet-500/30 transition-all duration-300">
                <h4 className="text-lg font-semibold text-white mb-4">Lighting Enhancement</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Improvement</span>
                    <span className="text-green-400 font-semibold">+85%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{width: '85%'}}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-violet-500/30 transition-all duration-300">
                <h4 className="text-lg font-semibold text-white mb-4">Style Transformation</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Scandinavian</span>
                    <span className="text-violet-400 font-semibold">Complete</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-violet-500 h-2 rounded-full transition-all duration-500" style={{width: '100%'}}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-violet-500/30 transition-all duration-300">
                <h4 className="text-lg font-semibold text-white mb-4">Generation Speed</h4>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-orange-400">15s</div>
                  <div className="text-gray-400 text-sm">vs 2-3 days</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <a
              href="#generator"
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full transition-all duration-300 border border-white/20 hover:scale-105 transform"
            >
              Create Your Space
            </a>
          </div>
        </div>
      </section>

      {/* How It Works - Process Optimization */}
      <section id="how-it-works" className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">
              Simplified Process for Professional Results
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              Transform any property in 3 simple steps, without technical knowledge or design experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-violet-500 flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Upload Your Image</h3>
              <p className="text-gray-400 mb-4">
                Drag or select any photo of the space you want to transform. Supports all common formats.
              </p>
              <div className="text-sm text-violet-400">
                Formats: JPG, PNG, WEBP • Up to 4K
              </div>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Describe Your Vision</h3>
              <p className="text-gray-400 mb-4">
                Write how you want the space to look or use our pre-designed styles for guaranteed results.
              </p>
              <div className="text-sm text-violet-400">
                Hundreds of styles • Full customization
              </div>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Get Professional Results</h3>
              <p className="text-gray-400 mb-4">
                In less than 30 seconds receive professional images ready for all your marketing channels.
              </p>
              <div className="text-sm text-violet-400">
                High resolution • Commercial use • Unlimited download
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Generator Section */}
      <section id="generator" className="py-20 bg-gray-900/50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">
            Create Your Space
          </h2>
          <p className="text-gray-400 text-center mb-12">
            Use our artificial intelligence to transform your environment
          </p>
          <ElegantImageGenerator user={user} userCredits={credits} onCreditUpdate={handleCreditUpdate} />
        </div>
      </section>

      {/* Image Ownership Section */}
      <section className="py-16 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-green-500/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">Your Images, Forever Yours</h2>
            </div>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Every image you generate is 100% yours. Download instantly, use commercially, and keep forever.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-2">Instant Download</h3>
                <p className="text-gray-400 text-sm">High-resolution images ready for immediate use</p>
              </div>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9V2.25" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-2">Commercial Use</h3>
                <p className="text-gray-400 text-sm">Full rights for all commercial purposes</p>
              </div>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-2">Forever Yours</h3>
                <p className="text-gray-400 text-sm">No expiration, keep your images permanently</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Professional Approach */}
      {!user && (
        <section className="py-20 bg-gray-900/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6 text-white">
              Ready to Transform Your Real Estate Business?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of professionals who are already increasing their sales and optimizing operations with artificial intelligence
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-violet-400 mb-1">500+</div>
                <div className="text-sm text-gray-400">Active Professionals</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-violet-400 mb-1">50K+</div>
                <div className="text-sm text-gray-400">Images Generated</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-violet-400 mb-1">98%</div>
                <div className="text-sm text-gray-400">Customer Satisfaction</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium rounded-full transition-all duration-300 shadow-lg shadow-violet-900/30 hover:shadow-violet-900/50 text-lg"
              >
                Request Access
              </a>
              <a
                href="/checkout"
                className="px-8 py-4 border border-white/20 hover:border-white/40 text-white font-medium rounded-full transition-all duration-300 text-lg"
              >
                View Plans
              </a>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section - SEO Content */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">
            Frequently Asked Questions About AI Property Transformation
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "What is the cost of generating property images with artificial intelligence?",
                a: "Our prices vary based on resolution and transformation type. Standard high-quality images start from $0.10 USD per image. We offer monthly plans for intensive use with discounts of up to 60%. The cost is significantly lower than traditional physical staging which can cost between $2,000 and $10,000 USD per property."
              },
              {
                q: "Can I use the AI-generated images for commercial purposes and real estate listings?",
                a: "Absolutely. All images generated with PixelAlchemy are your property and you can use them freely for any commercial purpose: social media, marketing materials, client presentations, websites, and any creative or business use."
              },
              {
                q: "How realistic are the images generated by artificial intelligence?",
                a: "Our technology generates photorealistic quality images that are indistinguishable from real professional photography. We use AI models specifically trained on interior and architectural images, ensuring natural lighting, correct proportions, realistic textures, and convincing furnishings."
              },
              {
                q: "How long does it take to generate a virtually staged property image?",
                a: "The average generation time is 15 to 30 seconds per image, regardless of space complexity. This allows generating multiple variations of the same space in minutes, something impossible with traditional staging methods that take days or weeks."
              },
              {
                q: "Do I need design knowledge or prior experience to use the platform?",
                a: "You don't need prior design or photography experience. Our platform is intuitive and designed for real estate professionals without technical knowledge. Additionally, we offer pre-designed styles created by interior design experts that guarantee professional results from first use."
              },
              {
                q: "What types of properties can be transformed with the platform?",
                a: "PixelAlchemy can generate any type of image: portraits, landscapes, abstract art, product photography, architectural visualization, concept art, and much more. The platform is equally effective for personal projects, professional work, or commercial applications."
              },
              {
                q: "Can the platform maintain specific elements from the original property?",
                a: "Yes, our artificial intelligence can maintain specific elements like architectural structure, windows, doors, and any feature you want to preserve while transforming only the furnishing, decoration, and atmosphere of the space."
              },
              {
                q: "Is there a limit on the number of images I can generate?",
                a: "Limits depend on the plan you choose. Our plans range from occasional use to unlimited enterprise volumes. You can change plans at any time based on your needs. We also offer custom plans for large developers and agencies."
              }
            ].map((faq, index) => (
              <details key={index} className="bg-white/5 rounded-xl border border-white/10 hover:border-violet-500/30 transition-all duration-300 group">
                <summary className="px-6 py-4 cursor-pointer text-white font-medium flex items-center justify-between">
                  {faq.q}
                  <svg className="w-5 h-5 text-gray-400 transition-transform group-hover:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-gray-400 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals - Final SEO Section */}
      <section className="py-16 bg-gray-900/50 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">ISO 27001</div>
              <div className="text-sm text-gray-400">Security Certified</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">GDPR</div>
              <div className="text-sm text-gray-400">Data Compliant</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-sm text-gray-400">Technical Support</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">99.9%</div>
              <div className="text-sm text-gray-400">Guaranteed Uptime</div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
