import Layout from '@/components/Layout';
import { getUserFromToken } from '@/lib/auth';

export default function CheckoutSuccess({ user, credits }) {
  return (
    <Layout title="Payment Successful - PixelAlchemy" user={user} credits={credits}>
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="card-glass text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-status-success/20 to-status-success/5 flex items-center justify-center border border-status-success/30">
            <svg className="w-10 h-10 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-neon">Payment Successful!</h1>
          <p className="text-xl text-text-secondary mb-8">
            Your credits have been added to your account.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/generate" className="btn-primary">Start Creating</a>
            <a href="/gallery" className="btn-outline">View Gallery</a>
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
