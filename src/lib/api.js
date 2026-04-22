// Helper function to make authenticated API calls
export async function authFetch(url, options = {}) {
  let token = null;

  // Only access localStorage on client side
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists (fallback mechanism)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Important for cookie-based auth
  });
}

// Function to get user from localStorage
export function getLocalUser() {
  if (typeof window === 'undefined') {
    return null; // Return null on server side
  }

  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
      return null;
    }
  }
  return null;
}

// Function to clear auth data
export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}
