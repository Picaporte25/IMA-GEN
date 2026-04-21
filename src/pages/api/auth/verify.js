import { getUserFromToken, verifyToken, supabaseAdmin } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Verify endpoint called');
    console.log('🔍 Cookies:', req.cookies);
    console.log('🔍 Authorization header:', req.headers.authorization);

    // Try to get user from token (checks cookies and headers)
    const user = await getUserFromToken(req);

    if (user) {
      console.log('✅ User found from token:', user.email);
      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          credits: user.credits,
        },
      });
    }

    console.log('❌ No user found from token, trying fallback methods...');

    // Fallback 1: Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('🔍 Trying token from Authorization header');

      try {
        const decoded = verifyToken(token);

        if (decoded) {
          console.log('✅ Token decoded, fetching user...');
          const { data: userFromToken } = await supabaseAdmin
            .from('users')
            .select('id, email, credits')
            .eq('id', decoded.id)
            .single();

          if (userFromToken) {
            console.log('✅ User found from Authorization header:', userFromToken.email);
            return res.status(200).json({
              user: {
                id: userFromToken.id,
                email: userFromToken.email,
                credits: userFromToken.credits,
              },
            });
          }
        }
      } catch (error) {
        console.error('❌ Error verifying Authorization header token:', error);
      }
    }

    // Fallback 2: Check cookie header manually
    if (req.headers.cookie) {
      const cookieHeader = req.headers.cookie;
      console.log('🔍 Manual cookie parsing:', cookieHeader.substring(0, 50) + '...');

      try {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          if (key && value) {
            acc[key] = decodeURIComponent(value);
          }
          return acc;
        }, {});

        const tokenFromCookie = cookies.token;
        if (tokenFromCookie) {
          console.log('🔍 Token found in cookie, verifying...');
          const decoded = verifyToken(tokenFromCookie);

          if (decoded) {
            const { data: userFromCookie } = await supabaseAdmin
              .from('users')
              .select('id, email, credits')
              .eq('id', decoded.id)
              .single();

            if (userFromCookie) {
              console.log('✅ User found from manual cookie parsing:', userFromCookie.email);
              return res.status(200).json({
                user: {
                  id: userFromCookie.id,
                  email: userFromCookie.email,
                  credits: userFromCookie.credits,
                },
              });
            }
          }
        }
      } catch (error) {
        console.error('❌ Error with manual cookie parsing:', error);
      }
    }

    console.log('❌ All verification methods failed');
    return res.status(401).json({ error: 'Unauthorized' });

  } catch (error) {
    console.error('❌ Verification error:', error);
    res.status(500).json({ error: 'Failed to verify user', details: error.message });
  }
}
