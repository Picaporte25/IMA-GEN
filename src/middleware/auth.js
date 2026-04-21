/**
 * Authentication middleware for protecting routes
 */

import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

/**
 * Middleware to protect API routes
 * Validates JWT token and attaches user to request
 */
export async function withAuth(handler) {
  return async (req, res) => {
    try {
      // Get token from multiple sources
      let token = null;

      // Method 1: Direct cookie access
      if (req.cookies?.token) {
        token = req.cookies.token;
      }
      // Method 2: Authorization header
      else if (req.headers?.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }
      // Method 3: Cookie header parsing
      else if (req.headers?.cookie) {
        const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {});
        token = cookies.token;
      }

      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Verify token
      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      // Get user from database
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('id, email, credits, created_at, updated_at')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Attach user to request
      req.user = user;
      req.token = token;

      // Call the actual handler
      return await handler(req, res);

    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(500).json({ error: 'Authentication error' });
    }
  };
}

/**
 * Middleware to check if user has sufficient credits
 */
export function withCredits(requiredCredits = 1) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userCredits = req.user.credits || 0;

      if (userCredits < requiredCredits) {
        return res.status(402).json({
          error: 'Insufficient credits',
          required: requiredCredits,
          available: userCredits,
          message: `You need ${requiredCredits} credit(s) but only have ${userCredits}`
        });
      }

      // Attach credits info to request
      req.creditsInfo = {
        available: userCredits,
        required: requiredCredits,
        sufficient: true
      };

      return next(req, res);

    } catch (error) {
      console.error('Credits middleware error:', error.message);
      return res.status(500).json({ error: 'Credits check error' });
    }
  };
}

/**
 * Middleware to check if user is admin (if you have admin roles)
 */
export function withAdmin(handler) {
  return async (req, res) => {
    try {
      // First ensure user is authenticated
      const authResult = await withAuth(handler)(req, res);
      if (authResult && res.statusCode === 401) {
        return authResult;
      }

      // Check if user has admin role (you'd need to add an 'is_admin' field to users table)
      if (!req.user.is_admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      return await handler(req, res);

    } catch (error) {
      console.error('Admin middleware error:', error.message);
      return res.status(500).json({ error: 'Admin authorization error' });
    }
  };
}

/**
 * Helper function to get authenticated user from request
 */
export function getAuthUser(req) {
  return req.user || null;
}

/**
 * Helper function to check if user is authenticated
 */
export function isAuthenticated(req) {
  return !!req.user;
}

/**
 * Helper function to check if user has sufficient credits
 */
export function hasCredits(req, requiredCredits = 1) {
  if (!req.user) return false;
  return (req.user.credits || 0) >= requiredCredits;
}
