import '../styles/globals.css';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Initialize Paddle if needed
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_PADDLE_CLIENT_SIDE_TOKEN) {
      // Paddle initialization would go here
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
