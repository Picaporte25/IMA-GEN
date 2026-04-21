import { getUserFromToken } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Verify endpoint called');
    console.log('Cookies:', req.cookies);
    console.log('Authorization header:', req.headers.authorization);

    const user = await getUserFromToken(req);

    if (!user) {
      console.log('No user found from token');

      // Check for localStorage fallback token
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        console.log('Trying token from Authorization header:', token.substring(0, 20) + '...');

        try {
          const { verifyToken, supabaseAdmin } = await import('@/lib/auth');
          const decoded = verifyToken(token);

          if (decoded) {
            const { data: userFromToken } = await supabaseAdmin
              .from('users')
              .select('*')
              .eq('id', decoded.id)
              .single();

            if (userFromToken) {
              console.log('User found from localStorage token');
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
          console.error('Error verifying localStorage token:', error);
        }
      }

      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Failed to verify user' });
  }
}
