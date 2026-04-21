import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';

export default function Register() {
  console.log('🟢 Register component rendered');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    console.log('🔵 Form submission started');
    console.log('🔵 Email:', email);
    console.log('🔵 Password length:', password.length);

    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match');
      setError('Passwords do not match');
      return;
    }

    // Validar requisitos de contraseña
    const passwordErrors = [];
    if (password.length < 8) {
      passwordErrors.push('at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      passwordErrors.push('an uppercase letter (A-Z)');
    }
    if (!/[a-z]/.test(password)) {
      passwordErrors.push('a lowercase letter (a-z)');
    }
    if (!/\d/.test(password)) {
      passwordErrors.push('a number (0-9)');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      passwordErrors.push('a special character (!@#$%)');
    }

    if (passwordErrors.length > 0) {
      const errorMessage = `Password must contain ${passwordErrors.join(', ')}`;
      console.log('❌ Password validation failed:', errorMessage);
      setError(errorMessage);
      return;
    }

    setLoading(true);

    try {
      console.log('🔵 Sending registration request...');
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('🔵 Response status:', response.status);
      const data = await response.json();
      console.log('🔵 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      console.log('🔵 Registration successful, redirecting...');
      // Redirect to generator or generate page based on query parameter
      const redirectPath = router.query.redirect === 'generator' ? '/#generator' : '/generate';
      router.push(redirectPath);
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
      console.log('🔵 Form submission completed');
    }
  };

  return (
    <Layout title="Sign Up - PixelAlchemy">
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="card-glass w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-accent-orange to-accent-violet flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-neon">Start Creating</h1>
            <p className="text-text-secondary mt-2">Get 1 free credit when you sign up</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-futuristic"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-futuristic"
                placeholder="Min 8 chars: A-Z, a-z, 0-9, !@#$%"
                required
                disabled={loading}
                minLength={8}
              />

              {/* Password Requirements Indicator */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className={`text-xs flex items-center gap-2 ${password.length >= 8 ? 'text-status-success' : 'text-text-muted'}`}>
                    <span>{password.length >= 8 ? '✓' : '○'}</span>
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`text-xs flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-status-success' : 'text-text-muted'}`}>
                    <span>{/[A-Z]/.test(password) ? '✓' : '○'}</span>
                    <span>Uppercase letter (A-Z)</span>
                  </div>
                  <div className={`text-xs flex items-center gap-2 ${/[a-z]/.test(password) ? 'text-status-success' : 'text-text-muted'}`}>
                    <span>{/[a-z]/.test(password) ? '✓' : '○'}</span>
                    <span>Lowercase letter (a-z)</span>
                  </div>
                  <div className={`text-xs flex items-center gap-2 ${/\d/.test(password) ? 'text-status-success' : 'text-text-muted'}`}>
                    <span>{/\d/.test(password) ? '✓' : '○'}</span>
                    <span>Number (0-9)</span>
                  </div>
                  <div className={`text-xs flex items-center gap-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-status-success' : 'text-text-muted'}`}>
                    <span>{/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '○'}</span>
                    <span>Special character (!@#$%)</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-futuristic"
                placeholder="Re-enter your password"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-status-error/10 border border-status-error/20 rounded-lg p-4">
                <p className="text-status-error text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              onClick={(e) => console.log('🔴 Button clicked')}
              disabled={loading}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="spinner-small" />
                  <span>Creating account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-secondary">
              Already have an account?{' '}
              <Link href="/login" className="link-futuristic">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
