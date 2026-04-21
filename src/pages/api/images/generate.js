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

    // Handle both JSON and FormData
    let prompt, negativePrompt, style, width, height, numberOfImages, referenceImage;

    if (req.headers['content-type']?.includes('multipart/form-data')) {
      // FormData handling
      const formData = req.body;
      prompt = formData.prompt;
      negativePrompt = formData.negativePrompt || '';
      style = formData.style || '';
      width = parseInt(formData.width) || 1024;
      height = parseInt(formData.height) || 1024;
      numberOfImages = parseInt(formData.numberOfImages) || 1;

      // Handle reference image - convert to base64 or upload to storage
      if (formData.referenceImage) {
        // For now, convert to base64 (in production, you'd upload to storage)
        const chunks = [];
        for await (const chunk of formData.referenceImage) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        const base64 = `data:${formData.referenceImage.mimeType || 'image/jpeg'};base64,${buffer.toString('base64')}`;
        referenceImage = base64;
      }
    } else {
      // JSON handling
      const body = req.body;
      prompt = body.prompt;
      negativePrompt = body.negativePrompt || '';
      style = body.style || '';
      width = body.width || 1024;
      height = body.height || 1024;
      numberOfImages = body.numberOfImages || 1;
      referenceImage = body.referenceImage;
    }

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
      const generationOptions = {
        negativePrompt,
        style,
        width,
        height,
        numberOfImages,
      };

      // Add reference image if provided
      if (referenceImage) {
        generationOptions.referenceImage = referenceImage;
      }

      const apiResult = await generateImage(prompt, generationOptions);

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
