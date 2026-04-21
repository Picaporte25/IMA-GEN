import { getUserFromToken, deductCredits, getUserCredits } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { generateImage, calculateCredits } from '@/lib/nanoBanana';
import { validateTextInput, sanitizeInput } from '@/lib/validation';
import { applySecurityHeaders } from '@/lib/cookies';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Apply security headers
    applySecurityHeaders(res);

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

    // Validate and sanitize prompt
    const promptValidation = validateTextInput(prompt, 'Prompt', 10, 2000);
    if (!promptValidation.valid) {
      return res.status(400).json({ error: promptValidation.error });
    }
    prompt = sanitizeInput(promptValidation.value);

    // Sanitize and validate other inputs
    if (negativePrompt) {
      const negPromptValidation = validateTextInput(negativePrompt, 'Negative prompt', 0, 500);
      if (negPromptValidation.valid) {
        negativePrompt = sanitizeInput(negPromptValidation.value);
      }
    }

    if (style) {
      const styleValidation = validateTextInput(style, 'Style', 0, 100);
      if (styleValidation.valid) {
        style = sanitizeInput(styleValidation.value);
      }
    }

    // Validate dimensions
    const validDimensions = [512, 768, 1024, 1536];
    if (!validDimensions.includes(width) || !validDimensions.includes(height)) {
      return res.status(400).json({
        error: `Invalid dimensions. Allowed values: ${validDimensions.join(', ')}px`
      });
    }

    // Validate number of images
    if (numberOfImages < 1 || numberOfImages > 4) {
      return res.status(400).json({
        error: 'Number of images must be between 1 and 4'
      });
    }

    // Calculate credits needed
    const creditsNeeded = calculateCredits(width, height, numberOfImages);
    const userCredits = await getUserCredits(user.id);

    if (userCredits < creditsNeeded) {
      return res.status(402).json({
        error: 'Insufficient credits',
        creditsNeeded,
        userCredits,
        message: `You need ${creditsNeeded} credit(s) but only have ${userCredits}. Please upgrade your plan.`
      });
    }

    // Validate that the user exists and is active
    const { data: userCheck, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('id, email, credits, status')
      .eq('id', user.id)
      .single();

    if (userCheckError || !userCheck) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (userCheck.status === 'suspended') {
      return res.status(403).json({
        error: 'Account suspended',
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    // Double-check credits with fresh data
    if (userCheck.credits < creditsNeeded) {
      return res.status(402).json({
        error: 'Insufficient credits',
        creditsNeeded,
        userCredits: userCheck.credits,
        message: 'Your credits have changed. Please refresh and try again.'
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

      // Deduct credits with transaction
      let remainingCredits;
      try {
        remainingCredits = await deductCredits(user.id, creditsNeeded, imageRecord.id);
      } catch (creditError) {
        console.error('Failed to deduct credits:', creditError);

        // Rollback: Mark image as failed due to credit issue
        await supabaseAdmin
          .from('images')
          .update({
            status: 'failed',
            error_message: 'Credit deduction failed',
          })
          .eq('id', imageRecord.id);

        return res.status(500).json({
          error: 'Credit processing failed',
          message: 'Image was generated but there was an issue processing credits. Please contact support.',
          image: {
            id: imageRecord.id,
            prompt: imageRecord.prompt,
            imageUrls: apiResult.images || [],
            status: 'completed',
          },
        });
      }

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
