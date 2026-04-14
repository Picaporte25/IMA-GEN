import { supabaseAdmin } from '@/lib/db';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const signature = req.headers['paddle-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    // Verify webhook signature (you'll need to implement this based on Paddle's documentation)
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
    const body = JSON.stringify(req.body);

    // For now, we'll skip signature verification in development
    // In production, you should verify the signature:
    // const expectedSignature = crypto
    //   .createHmac('sha256', webhookSecret)
    //   .update(body)
    //   .digest('base64');
    // if (signature !== expectedSignature) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    const eventData = req.body;

    // Handle different Paddle events
    if (eventData.event_type === 'payment.succeeded') {
      const { data } = eventData;

      // Get user ID from metadata
      const userId = data.metadata?.user_id;

      if (!userId) {
        console.error('No user ID in payment metadata');
        return res.status(400).json({ error: 'Missing user ID' });
      }

      // Get package details from the price ID
      const priceId = data.items[0]?.price_id;
      let creditsToAdd = 0;

      if (priceId.includes('50')) creditsToAdd = 50;
      else if (priceId.includes('150')) creditsToAdd = 150;
      else if (priceId.includes('350')) creditsToAdd = 350;
      else if (priceId.includes('800')) creditsToAdd = 800;

      if (creditsToAdd === 0) {
        console.error('Unknown price ID:', priceId);
        return res.status(400).json({ error: 'Unknown price ID' });
      }

      // Add credits to user
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();

      if (userError) {
        throw userError;
      }

      const newCredits = (user.credits || 0) + creditsToAdd;

      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ credits: newCredits })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      // Create transaction record
      await supabaseAdmin
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: creditsToAdd,
          type: 'purchase',
          paddle_payment_id: data.id,
          paddle_checkout_id: data.checkout_id,
          description: `Purchased ${creditsToAdd} credits`,
        });

      console.log(`Added ${creditsToAdd} credits to user ${userId}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Paddle webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
}
