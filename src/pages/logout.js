import { useEffect } from 'react';

export default function Logout() {
  useEffect(() => {
    const doLogout = async () => {
      try {
        // Aggressively clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.clear();
        }

        // Call logout API to clear cookies
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Force hard reload to clear all state
        window.location.replace('/');
      }
    };

    doLogout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="spinner-futuristic mx-auto mb-4" />
        <p className="text-text-secondary">Logging out...</p>
      </div>
    </div>
  );
}
