import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

export default function Generate() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page since generation is now on main page
    router.push('/');
  }, [router]);

  return (
    <Layout
      title="Redirecting..."
      description="Redirecting to home page..."
      user={null}
      credits={0}
    >
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner-large" />
      </div>
    </Layout>
  );
}
