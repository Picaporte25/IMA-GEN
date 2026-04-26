import Layout from '@/components/Layout';
import { useState } from 'react';

export default function AddCreditsPage() {
  const [email, setEmail] = useState('');
  const [credits, setCredits] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddCredits = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/add-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, credits }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add credits');
      }

      setMessage(`✅ Success! Added ${credits} credit(s) to ${email}`);
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Add Credits - Admin">
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="card-glass w-full max-w-md">
          <h1 className="text-3xl font-bold text-neon mb-6">Add Credits to User</h1>

          <form onSubmit={handleAddCredits} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                User Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-futuristic w-full"
                placeholder="user@example.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Credits to Add
              </label>
              <input
                type="number"
                value={credits}
                onChange={(e) => setCredits(parseInt(e.target.value))}
                className="input-futuristic w-full"
                min="1"
                max="100"
                required
                disabled={loading}
              />
            </div>

            {message && (
              <div className="p-4 rounded-lg bg-background-secondary">
                <p className="text-sm">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4"
            >
              {loading ? 'Adding credits...' : 'Add Credits'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
