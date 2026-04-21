import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { getLocalUser } from '@/lib/api';

export default function Generate() {
  const router = useRouter();
  const [user, setUser] = useState(() => getLocalUser());
  const [credits, setCredits] = useState(() => getLocalUser()?.credits || 0);

  useEffect(() => {
    // Redirect to home page since generation is now on main page
    router.push('/');
  }, [router]);

  return (
    <Layout
      title="Redirecting..."
      description="Redirecting to home page..."
      user={user || null}
      credits={credits || 0}
    >
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner-large" />
      </div>
    </Layout>
  );
}
