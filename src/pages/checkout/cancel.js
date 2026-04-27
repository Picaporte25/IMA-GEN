import Layout from '@/components/Layout';
import { getUserFromToken } from '@/lib/auth';

export default function CheckoutCancel({ user, credits }) {
  return (
    <Layout title="Payment Cancelled - PixelAlchemy" user={user} credits={credits}>
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="card-glass text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-status-warning/20 to-status-warning/5 flex items-center justify-center border border-status-warning/30">
            <svg className="w-10 h-10 text-status-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-neon">Payment Cancelled</h1>
          <p className="text-xl text-text-secondary mb-8">
            No worries! You can try again whenever you're ready.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/checkout" className="btn-primary">Try Again</a>
            <a href="/" className="btn-outline">Go Home</a>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const user = await getUserFromToken(context);

  return {
    props: {
      user,
      credits: user?.credits || 0,
    },
  };
}
