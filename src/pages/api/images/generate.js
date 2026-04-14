import { getUserFromToken, deductCredits, getUserCredits } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { generateImage, calculateCredits } from '@/lib/nanoBanana';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      prompt,
      negativePrompt = '',
      style = '',
      width = 1024,
      height = 1024,
      numberOfImages = 1,
    } = req.body;

    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Calculate credits needed
    const creditsNeeded = calculateCredits(width, height, numberOfImages);
    const userCredits = await getUserCredits(user.id);

    if (userCredits < creditsNeeded) {
      return res.status(402).json({
        error: 'Insufficient credits',
        creditsNeeded,
        userCredits,
      });
    }

    // Create image record in database
    const { data: imageRecord, error: dbError } = await supabaseAdmin
      .from('images')
      .insert({
        user_id: user.id,
        prompt: prompt.trim(),
        negative_prompt: negativePrompt.trim(),
        style,
        width,
        height,
        number_of_images: numberOfImages,
        credits_used: creditsNeeded,
        status: 'generating',
      })
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    try {
      // Call Nano Banana API
      const apiResult = await generateImage(prompt, {
        negativePrompt,
        style,
        width,
        height,
        numberOfImages,
      });

      // Update image record with results
      const { error: updateError } = await supabaseAdmin
        .from('images')
        .update({
          status: 'completed',
          image_urls: apiResult.images || [],
          progress: 100,
        })
        .eq('id', imageRecord.id);

      if (updateError) {
        throw updateError;
      }

      // Deduct credits
      const remainingCredits = await deductCredits(user.id, creditsNeeded, imageRecord.id);

      res.status(200).json({
        message: 'Image generated successfully',
        image: {
          id: imageRecord.id,
          prompt: imageRecord.prompt,
          imageUrls: apiResult.images || [],
          status: 'completed',
        },
        remainingCredits,
      });
    } catch (apiError) {
      // Mark image as failed
      await supabaseAdmin
        .from('images')
        .update({
          status: 'failed',
          progress: 0,
        })
        .eq('id', imageRecord.id);

      throw apiError;
    }
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({
      error: 'Failed to generate image',
      details: error.message,
    });
  }
}
