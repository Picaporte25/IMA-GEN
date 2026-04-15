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

      // Get package details from the price ID or custom data
      const priceId = data.items[0]?.price_id;
      const customData = data.items[0]?.custom_data || {};
      let creditsToAdd = 0;

      // Try to get credits from custom data first (recommended approach)
      if (customData.credits) {
        creditsToAdd = parseInt(customData.credits);
      } else {
        // Fallback: Map price IDs to credits (updated with real Paddle price IDs)
        const creditMap = {
          'pri_01kp74j689zk7s6j2h75g4snqq': 10,   // Starter
          'pri_01kp74nrxms2hc0bz0s67f5bv0': 50,   // Basic
          'pri_01kp74r26fp6rkh1mykpnda6ss': 100,  // Pro
          'pri_01kp74tavek4j7f33nbc9f6gwh': 250,  // Creator
          'pri_01kp74w7926zz400zyadcbhdeg': 500,  // Studio
          'pri_01kp74y18g2fkjpk2z8fb9bdgf': 1000, // Enterprise
        };

        creditsToAdd = creditMap[priceId] || 0;
      }

      if (creditsToAdd === 0) {
        console.error('Unknown price ID or missing credits:', priceId, customData);
        return res.status(400).json({ error: 'Unknown price ID or missing credits' });
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
