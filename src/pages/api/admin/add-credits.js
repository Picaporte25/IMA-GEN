import { supabaseAdmin } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, credits } = req.body;

    if (!email || !credits) {
      return res.status(400).json({ error: 'Email and credits are required' });
    }

    // Get user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update credits
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ credits: user.credits + credits })
      .eq('email', email);

    if (updateError) {
      throw updateError;
    }

    res.status(200).json({
      message: 'Credits added successfully',
      previousCredits: user.credits,
      newCredits: user.credits + credits,
    });
  } catch (error) {
    console.error('Error adding credits:', error);
    res.status(500).json({ error: 'Failed to add credits' });
  }
}
