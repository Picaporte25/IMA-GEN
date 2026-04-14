import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ImageGallery from '@/components/ImageGallery';
import { getUserFromToken, getUserCredits } from '@/lib/auth';

export default function Gallery({ user, initialCredits }) {
  const [credits, setCredits] = useState(initialCredits);

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
    <Layout title="My Gallery - Gene-Image" user={user} credits={credits}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!user ? (
          <div className="card-glass text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent-orange/20 to-accent-orange/5 flex items-center justify-center border border-accent-orange/30">
              <svg className="w-10 h-10 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-neon">Login to View Your Gallery</h2>
            <p className="text-text-secondary mb-6">
              Sign in to see all your generated images.
            </p>
            <div className="flex gap-4 justify-center">
              <a href="/login" className="btn-primary">Login</a>
              <a href="/register" className="btn-outline">Sign Up</a>
            </div>
          </div>
        ) : (
          <ImageGallery userId={user.id} />
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
