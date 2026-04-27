import { getUserFromToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('💰 Credits balance request received');
    console.log('🍪 Cookies:', req.cookies ? 'Present' : 'Missing');
    console.log('🔑 Auth header:', req.headers.authorization ? 'Present' : 'Missing');

    const user = await getUserFromToken(req);

    if (!user) {
      console.log('❌ No user found from token');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('✅ User authenticated for credits:', user.email);

    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('❌ Error fetching user credits:', error);
      throw error;
    }

    console.log('✅ User credits:', userData.credits);

    res.status(200).json({ credits: userData.credits });
  } catch (error) {
    console.error('❌ Get credits error:', error);
    res.status(500).json({ error: 'Failed to get credits' });
  }
}
