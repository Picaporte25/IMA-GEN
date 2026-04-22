import { getUserFromToken, verifyToken, deductCredits, getUserCredits } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { generateImage, calculateCredits } from '@/lib/nanoBanana';
import { validateTextInput, sanitizeInput } from '@/lib/validation';
import { applySecurityHeaders } from '@/lib/cookies';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Apply security headers
    applySecurityHeaders(res);

    // Try multiple authentication methods
    let user = await getUserFromToken(req);

    if (!user) {
      // Fallback 1: Try Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const decoded = verifyToken(token);
          if (decoded) {
            const { data: userFromHeader } = await supabaseAdmin
              .from('users')
              .select('id, email, credits')
              .eq('id', decoded.id)
              .single();

            if (userFromHeader) {
              user = userFromHeader;
            }
          }
        } catch (error) {
          console.error('Error with Authorization header:', error);
        }
      }

      // Fallback 2: Try manual cookie parsing
      if (!user && req.headers.cookie) {
        try {
          const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            if (key && value) {
              acc[key] = decodeURIComponent(value);
            }
            return acc;
          }, {});

          const tokenFromCookie = cookies.token;
          if (tokenFromCookie) {
            const decoded = verifyToken(tokenFromCookie);
            if (decoded) {
              const { data: userFromCookie } = await supabaseAdmin
                .from('users')
                .select('id, email, credits')
                .eq('id', decoded.id)
                .single();

              if (userFromCookie) {
                user = userFromCookie;
              }
            }
          }
        } catch (error) {
          console.error('Error with cookie parsing:', error);
        }
      }
    }

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Please log in to generate images',
        details: 'No valid authentication token found. Please log in again.'
      });
    }

    // Handle JSON request (simpler and more reliable)
    const body = req.body;
    let prompt, negativePrompt, style, width, height, numberOfImages, referenceImage;

    if (req.headers['content-type']?.includes('application/json')) {
      prompt = body.prompt || '';
      negativePrompt = body.negativePrompt || '';
      style = body.style || '';
      width = body.width || 1024;
      height = body.height || 1024;
      numberOfImages = body.numberOfImages || 1;
      referenceImage = body.referenceImage;
    } else {
      // Fallback to FormData
      const formData = req.body;
      prompt = formData.prompt || '';
      negativePrompt = formData.negativePrompt || '';
      style = formData.style || '';
      width = parseInt(formData.width) || 1024;
      height = parseInt(formData.height) || 1024;
      numberOfImages = parseInt(formData.numberOfImages) || 1;
      referenceImage = body.referenceImage;
    }

    console.log('📝 Generar imagen con:', { prompt: prompt.substring(0, 50) + '...', style, width, height });

    // Validate and sanitize prompt - more lenient requirements
    const promptValidation = validateTextInput(prompt, 'Prompt', 1, 2000);
    if (!promptValidation.valid) {
      console.log('❌ Validación de prompt falló:', promptValidation.error);
      return res.status(400).json({ error: promptValidation.error });
    }
    prompt = sanitizeInput(promptValidation.value);

    // If only style is provided but no prompt, use the style's prompt
    if (!prompt || prompt.trim() === '') {
      if (style) {
        // Try to get the style's prompt from REAL_ESTATE_STYLES
        try {
          const { REAL_ESTATE_STYLES } = await import('@/lib/nanoBanana');
          const selectedStyleObj = REAL_ESTATE_STYLES.find(s => s.id === style);
          if (selectedStyleObj && selectedStyleObj.prompt) {
            prompt = selectedStyleObj.prompt;
            console.log('✅ Usando prompt del estilo:', prompt.substring(0, 50) + '...');
          }
        } catch (error) {
          console.error('Error al obtener prompt del estilo:', error);
        }
      }

      if (!prompt || prompt.trim() === '') {
        console.log('❌ No hay prompt válido');
        return res.status(400).json({
          error: 'Prompt is required',
          message: 'Please provide a description or select a style'
        });
      }
    }

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
