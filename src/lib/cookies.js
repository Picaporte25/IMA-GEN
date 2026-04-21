/**
 * Cookie management utilities with security best practices
 */

/**
 * Gets the domain for cookies based on the current environment
 */
function getCookieDomain() {
  if (typeof window === 'undefined') {
    // Server-side
    const host = process.env.NEXT_PUBLIC_APP_URL || 'localhost';
    try {
      const url = new URL(host);
      // For production, use the domain without subdomain for cross-subdomain cookies
      if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
        const domainParts = url.hostname.split('.');
        if (domainParts.length > 2) {
          return `.${domainParts.slice(-2).join('.')}`;
        }
        return url.hostname;
      }
    } catch (e) {
      console.error('Error parsing app URL:', e);
    }
    return undefined; // Let browser handle domain
  }
  return undefined;
}

/**
 * Gets secure cookie configuration based on environment
 */
export function getSecureCookieConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isSecure = isProduction || process.env.VERCEL_ENV === 'production';

  return {
    httpOnly: true,           // Prevent JavaScript access (XSS protection)
    secure: isSecure,         // Only send over HTTPS in production
    sameSite: isProduction ? 'strict' : 'lax', // CSRF protection
    path: '/',                // Available on all paths
    maxAge: 604800,           // 7 days in seconds
    domain: getCookieDomain(), // Set domain for cross-subdomain cookies
    priority: 'high'          // High priority cookie
  };
}

/**
 * Creates a cookie string with secure configuration
 */
export function createSecureCookie(name, value, options = {}) {
  const config = { ...getSecureCookieConfig(), ...options };

  const cookieParts = [
    `${name}=${value}`,
    `HttpOnly`,
    `Path=${config.path}`,
    `Max-Age=${config.maxAge}`
  ];

  if (config.secure) {
    cookieParts.push('Secure');
  }

  if (config.sameSite) {
    cookieParts.push(`SameSite=${config.sameSite}`);
  }

  if (config.domain) {
    cookieParts.push(`Domain=${config.domain}`);
  }

  if (config.priority) {
    cookieParts.push(`Priority=${config.priority}`);
  }

  return cookieParts.join('; ');
}

/**
 * Sets an authentication cookie with best security practices
 */
export function setAuthCookie(res, token) {
  const cookieString = createSecureCookie('token', token);
  res.setHeader('Set-Cookie', cookieString);
  return cookieString;
}

/**
 * Clears an authentication cookie
 */
export function clearAuthCookie(res) {
  const config = getSecureCookieConfig();
  const cookieString = [
    `token=`,
    `HttpOnly`,
    `Path=${config.path}`,
    `Max-Age=0`,
    `Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  ];

  if (config.domain) {
    cookieString.push(`Domain=${config.domain}`);
  }

  res.setHeader('Set-Cookie', cookieString.join('; '));
}

/**
 * Creates multiple secure cookies (for when you need multiple auth tokens)
 */
export function setMultipleSecureCookies(res, cookies) {
  const cookieStrings = [];

  for (const [name, value] of Object.entries(cookies)) {
    cookieStrings.push(createSecureCookie(name, value));
  }

  res.setHeader('Set-Cookie', cookieStrings);
}

/**
 * Parses cookies from a cookie header
 */
export function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};

  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = decodeURIComponent(value || '');
    return acc;
  }, {});
}

/**
 * Gets a specific cookie value from request
 */
export function getCookie(req, name) {
  // Try multiple ways to get cookies
  if (req.cookies && req.cookies[name]) {
    return req.cookies[name];
  }

  if (req.headers && req.headers.cookie) {
    const cookies = parseCookies(req.headers.cookie);
    return cookies[name];
  }

  return null;
}

/**
 * Validates cookie configuration for security issues
 */
export function validateCookieSecurity(config) {
  const issues = [];

  if (!config.httpOnly) {
    issues.push('Cookie is not HttpOnly - vulnerable to XSS');
  }

  if (!config.secure && process.env.NODE_ENV === 'production') {
    issues.push('Cookie is not Secure - vulnerable to interception');
  }

  if (!config.sameSite || config.sameSite === 'none') {
    issues.push('Cookie has weak SameSite policy - vulnerable to CSRF');
  }

  if (config.maxAge > 86400) { // More than 1 day
    issues.push('Cookie has very long expiration time - security risk');
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Security headers for cookie-related responses
 */
export function getCookieSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'",
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
}

/**
 * Applies security headers to response
 */
export function applySecurityHeaders(res) {
  const headers = getCookieSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
}
