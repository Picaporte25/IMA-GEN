import Layout from '@/components/Layout';
import { getUserFromToken } from '@/lib/auth';

const PLANS = [
  {
    name: 'Starter',
    credits: 10,
    price: 2,
    description: 'Perfect for trying out',
    features: [
      '10 rooms staged',
      'Standard resolution',
      'Email support',
      'Commercial use',
    ],
  },
  {
    name: 'Basic',
    credits: 50,
    price: 8,
    description: 'Great for casual users',
    features: [
      '50 rooms staged',
      'Standard resolution',
      'Email support',
      'Commercial use',
    ],
  },
  {
    name: 'Pro',
    credits: 100,
    price: 15,
    description: 'Most popular choice',
    features: [
      '100 rooms staged',
      'High resolution up to 2K',
      'Priority support',
      'Commercial use',
      'Faster generation',
    ],
  },
  {
    name: 'Agent',
    credits: 250,
    price: 35,
    description: 'For busy agents',
    features: [
      '250 rooms staged',
      'Ultra HD up to 4K',
      'Priority support',
      'Commercial use',
      'Fastest generation',
      'API access',
    ],
  },
  {
    name: 'Agency',
    credits: 500,
    price: 65,
    description: 'For real estate agencies',
    features: [
      '500 rooms staged',
      'Ultra HD up to 4K',
      'Priority support',
      'Commercial use',
      'Fastest generation',
      'API access',
    ],
  },
  {
    name: 'Enterprise',
    credits: 1000,
    price: 120,
    description: 'For large brokerages',
    features: [
      '1000 rooms staged',
      'Ultra HD up to 4K',
      'Dedicated support',
      'Commercial use',
      'Fastest generation',
      'API access + webhooks',
      'Custom integrations',
    ],
  },
];

export async function getServerSideProps(context) {
  const user = await getUserFromToken(context);

  return {
    props: {
      user,
      credits: user?.credits || 0,
    },
  };
}

export default function Pricing({ user, credits }) {
  const handlePurchase = (plan) => {
    if (user) {
      window.location.href = `/checkout?plan=${plan.name.toLowerCase()}`;
    } else {
      window.location.href = `/register`;
    }
  };

  return (
    <Layout
      title="Virtual Staging Pricing | Professional Real Estate Staging Credits"
      description="Affordable virtual staging pricing for real estate professionals. Pay-per-use credits, no subscriptions, commercial use included. Transform properties instantly!"
      keywords="virtual staging pricing, real estate staging costs, affordable property staging, pay per use staging, AI furniture placement pricing"
      user={user}
      credits={credits}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-neon">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Stage your properties at affordable prices. Pay only for what you use.
          </p>
          <div className="mt-6 flex items-center justify-center gap-8 text-sm text-text-muted">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-status-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No subscriptions</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-status-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Credits never expire</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-status-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Commercial use OK</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="card-glass relative"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-text-primary mb-2">{plan.name}</h3>
                <p className="text-text-secondary text-sm mb-4">{plan.description}</p>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-neon">{plan.credits}</span>
                  <span className="text-text-secondary text-lg ml-1">credits</span>
                </div>
                <div className="text-3xl font-bold text-white mb-4">${plan.price}</div>
                <p className="text-text-muted text-sm">
                  ${(plan.price / plan.credits).toFixed(2)} per image
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-text-secondary">
                    <svg className="w-5 h-5 text-accent-violet flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchase(plan)}
                className="w-full py-3 rounded-lg font-semibold transition-all btn-primary"
              >
                {user ? 'Buy Now' : 'Sign Up'}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-neon">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="card-glass">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                How do credits work?
              </h3>
              <p className="text-text-secondary text-sm">
                Each room staging consumes credits based on image quality. Standard 1024×1024 staging costs 2 credits each.
                Higher quality staging uses more credits. You can stage rooms until your credits run out.
              </p>
            </div>

            <div className="card-glass">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Do credits expire?
              </h3>
              <p className="text-text-secondary text-sm">
                No, credits never expire. You can use them whenever you want, at your own pace.
              </p>
            </div>

            <div className="card-glass">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Can I use staged images commercially?
              </h3>
              <p className="text-text-secondary text-sm">
                Yes! All staged images are 100% yours to use for any purpose, including MLS listings,
                marketing materials, brochures, websites, and social media.
              </p>
            </div>

            <div className="card-glass">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-text-secondary text-sm">
                We accept all major credit cards and PayPal through our secure payment processing.
              </p>
            </div>

            <div className="card-glass">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Is there a free trial?
              </h3>
              <p className="text-text-secondary text-sm">
                Yes! When you sign up, you get 10 free rooms to stage. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
