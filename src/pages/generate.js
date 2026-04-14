import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ImageGenerator from '@/components/ImageGenerator';
import { getUserFromToken, getUserCredits } from '@/lib/auth';

export default function Generate({ user, initialCredits }) {
  const [credits, setCredits] = useState(initialCredits);

  const handleCreditUpdate = (newCredits) => {
    setCredits(newCredits);
  };

  // Poll for credit updates every 30 seconds
  useEffect(() => {
    if (user) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch('/api/credits/balance');
          const data = await response.json();
          setCredits(data.credits);
        } catch (error) {
          console.error('Failed to fetch credits:', error);
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <Layout title="Generate Images - Gene-Image" user={user} credits={credits}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-neon">
            Create Your Images
          </h1>
          <p className="text-text-secondary text-lg">
            Describe what you want to create and let AI bring your vision to life.
          </p>
        </div>

        {!user ? (
          <div className="card-glass text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent-orange/20 to-accent-orange/5 flex items-center justify-center border border-accent-orange/30">
              <svg className="w-10 h-10 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-neon">Sign Up to Generate Images</h2>
            <p className="text-text-secondary mb-6">
              Get 10 free credits when you sign up to try our AI image generator.
            </p>
            <div className="flex gap-4 justify-center">
              <a href="/register" className="btn-primary">Sign Up Free</a>
              <a href="/login" className="btn-outline">Login</a>
            </div>
          </div>
        ) : (
          <ImageGenerator userCredits={credits} onCreditUpdate={handleCreditUpdate} />
        )}
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const user = await getUserFromToken(context);
  const credits = user ? await getUserCredits(user.id) : 0;

  return {
    props: {
      user,
      initialCredits: credits,
    },
  };
}
