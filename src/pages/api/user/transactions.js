import { getUserFromToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get query parameters for filtering
    const { type, limit = 50, offset = 0 } = req.query;

    // Build query with filters
    let query = supabaseAdmin
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id);

    // Filter by type if specified
    if (type && ['purchase', 'usage', 'refund'].includes(type)) {
      query = query.eq('type', type);
    }

    // Execute query with pagination
    const { data: transactions, error } = await query
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      throw error;
    }

    // Get transaction counts by type
    const { data: counts } = await supabaseAdmin
      .from('credit_transactions')
      .select('type')
      .eq('user_id', user.id);

    const transactionCounts = {
      total: counts?.length || 0,
      purchase: counts?.filter(t => t.type === 'purchase').length || 0,
      usage: counts?.filter(t => t.type === 'usage').length || 0,
      refund: counts?.filter(t => t.type === 'refund').length || 0
    };

    // Get user's current credits
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single();

    res.status(200).json({
      transactions: transactions || [],
      counts: transactionCounts,
      currentCredits: userData?.credits || 0,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: transactions?.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}
