const FAL_API_KEY = process.env.FAL_API_KEY || 'abdb3c06-54db-490f-8cbc-8a6cac05dc6b:f749901fdce27be595bc31196aecf775';
const FAL_API_BASE = 'https://fal.run';
const FAL_IMAGE_MODEL = 'fal-ai/z-image/turbo';
const FAL_CONTROLNET_MODEL = 'fal-ai/z-image/turbo/controlnet';

// Qwen Image Edit Configuration
const QWEN_API_KEY = 'sk-652f0dacc61f4f7ea228870cd67e788e';
const QWEN_API_BASE = 'https://dashscope.aliyuncs.com/';

export async function generateImage(prompt, options = {}) {
  const {
    negativePrompt = '',
    style = '',
    width = 1024,
    height = 1024,
    numberOfImages = 1,
    referenceImage = null,
  } = options;

  try {
    // Build enhanced prompt with style
    let enhancedPrompt = prompt;
    if (style) {
      const styleMap = {
        'photorealistic': 'photorealistic, highly detailed, professional photography',
        'digital-art': 'digital art, modern illustration, vibrant colors',
        'oil-painting': 'oil painting, classic art style, rich textures',
        'watercolor': 'watercolor painting, soft colors, artistic',
        'anime': 'anime style, Japanese animation, vibrant',
        '3d-render': '3D rendered image, CGI, high quality',
        'pixel-art': 'pixel art style, retro game art, 8-bit',
        'concept-art': 'concept art, detailed illustration, sci-fi',
      };
      enhancedPrompt = `${styleMap[style] || ''}, ${prompt}`;
    }

    let response;

    // Use image editing model if reference image is provided
    if (referenceImage) {
      // For now, use the Qwen image edit API for reference images
      // as it handles image-to-image editing better
      const qwenResult = await editPropertyQwen(referenceImage, enhancedPrompt, {
        style,
        negativePrompt,
        strength: 0.8,
      });

      return {
        images: [qwenResult.imageUrl],
        success: true,
        requestId: qwenResult.requestId,
      };
    }

    // Regular image generation without reference
    const imageSize = mapWidthHeightToZImageSize(width, height);

    response = await fetch(`${FAL_API_BASE}/${FAL_IMAGE_MODEL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${FAL_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        num_images: numberOfImages,
        image_size: imageSize,
        num_inference_steps: 8,
        output_format: 'png',
        acceleration: 'regular',
        enable_safety_checker: true,
        sync_mode: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate image');
    }

    const data = await response.json();

    // Format response to match expected structure
    return {
      images: data.images ? data.images.map(img => img.url) : [],
      success: true,
      requestId: data.request_id || Date.now().toString(),
    };
  } catch (error) {
    console.error('FAL API error:', error);
    throw error;
  }
}

export async function getImageStatus(requestId) {
  try {
    // FAL.ai returns images synchronously with sync_mode, so we don't need to check status
    return {
      status: 'completed',
      images: [],
    };
  } catch (error) {
    console.error('Status check error:', error);
    throw error;
  }
}

export function calculateCredits(width, height, numberOfImages = 1) {
  // Simple credit system: 1 image = 1 credit
  // This matches the pricing: 1 credit = $0.20
  const credits = numberOfImages;
  return credits;
}

// Helper function to calculate megapixels (for debugging/display)
export function calculateMegapixels(width, height) {
  return (width * height) / 1000000;
}

// Helper function to map width/height to Z-Image Turbo image_size format
function mapWidthHeightToZImageSize(width, height) {
  const ratio = width / height;
  const maxDimension = Math.max(width, height);

  // Map to Z-Image Turbo supported sizes
  // Common sizes: square_hd, landscape_4_3, landscape_16_9, portrait_3_4, portrait_9_16, etc.
  if (ratio > 0.9 && ratio < 1.1) {
    // Square-ish
    if (maxDimension <= 512) return 'square_hd';
    if (maxDimension <= 1024) return 'square_hd';
    return 'square_hd';
  } else if (ratio > 1.3) {
    // Landscape
    if (ratio > 1.7) return 'landscape_16_9';
    return 'landscape_4_3';
  } else {
    // Portrait
    if (ratio < 0.6) return 'portrait_9_16';
    return 'portrait_3_4';
  }
}

export const IMAGE_STYLES = [
  { id: 'photorealistic', name: 'Photorealistic', description: 'Real photos, high detail' },
  { id: 'digital-art', name: 'Digital Art', description: 'Modern digital illustration' },
  { id: 'oil-painting', name: 'Oil Painting', description: 'Classic oil painting style' },
  { id: 'watercolor', name: 'Watercolor', description: 'Soft watercolor painting' },
  { id: 'anime', name: 'Anime', description: 'Japanese anime style' },
  { id: '3d-render', name: '3D Render', description: '3D rendered image' },
  { id: 'pixel-art', name: 'Pixel Art', description: 'Retro pixel art style' },
  { id: 'concept-art', name: 'Concept Art', description: 'Conceptual illustration' },
];

export const IMAGE_RESOLUTIONS = [
  { id: '512x512', width: 512, height: 512, label: '512×512 (Fast - Ultra low cost)' },
  { id: '768x768', width: 768, height: 768, label: '768×768 (Balanced - Low cost)' },
  { id: '1024x1024', width: 1024, height: 1024, label: '1024×1024 (HD - Standard)' },
  { id: '1536x1536', width: 1536, height: 1536, label: '1536×1536 (UHD - Premium)' },
  { id: '2048x2048', width: 2048, height: 2048, label: '2048×2048 (4K - Ultra premium)' },
];

// Real Estate Room Styles for generation
export const REAL_ESTATE_STYLES = [
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    description: 'Clean lines, neutral colors, minimal furniture',
    icon: '🏠',
    prompt: 'modern minimalist interior design, clean lines, neutral color palette, minimal furniture arrangement, plenty of white space, natural lighting'
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    description: 'Cozy and functional with warm wood tones',
    icon: '🪵',
    prompt: 'Scandinavian interior design, cozy atmosphere, warm wood furniture, functional layout, soft textiles, natural materials, neutral beige and gray tones'
  },
  {
    id: 'asian-zen',
    name: 'Asian Zen',
    description: 'Harmonious balance with natural elements',
    icon: '🎋',
    prompt: 'Asian zen interior design, harmonious balance, natural elements, bamboo furniture, minimal decoration, calming atmosphere, earth tones, plants and water features'
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Raw materials, metal accents, open spaces',
    icon: '🏭',
    prompt: 'industrial interior design, raw materials, exposed brick, metal accents, open spaces, concrete floors, vintage lighting fixtures, neutral color palette'
  },
  {
    id: 'luxury-classic',
    name: 'Luxury Classic',
    description: 'Elegant furniture, rich materials, sophisticated',
    icon: '✨',
    prompt: 'luxury classic interior design, elegant furniture, rich materials, sophisticated atmosphere, marble accents, gold or brass fixtures, deep colors, high-end furniture'
  },
  {
    id: 'bohemian',
    name: 'Bohemian',
    description: 'Eclectic mix, patterns, vibrant colors',
    icon: '🎨',
    prompt: 'bohemian interior design, eclectic mix, patterns and textures, vibrant colors, plants and textiles, artistic furniture, relaxed atmosphere, layered decorations'
  },
  {
    id: 'coastal',
    name: 'Coastal/Beach',
    description: 'Light and airy, natural materials, ocean colors',
    icon: '🌊',
    prompt: 'coastal interior design, light and airy atmosphere, natural materials, ocean colors, white furniture, blue and sand accents, natural lighting, beach house aesthetic'
  },
  {
    id: 'mid-century-modern',
    name: 'Mid-Century Modern',
    description: 'Retro furniture, organic shapes, warm colors',
    icon: '🛋',
    prompt: 'mid-century modern interior design, retro furniture, organic shapes, warm orange and brown colors, clean lines, functional design, vintage aesthetic'
  },
  {
    id: 'japanese',
    name: 'Japanese Traditional',
    description: 'Minimal, natural materials, tatami, sliding doors',
    icon: '🏯',
    prompt: 'traditional Japanese interior design, minimal furniture, natural materials, tatami floors, shoji screens, sliding doors, neutral earth tones, zen atmosphere'
  },
  {
    id: 'french-country',
    name: 'French Country',
    description: 'Rustic elegance, vintage charm, soft colors',
    icon: '🇫🇷',
    prompt: 'French country interior design, rustic elegance, vintage charm, soft pastel colors, antique furniture, floral patterns, farmhouse aesthetic, cozy atmosphere'
  },
  {
    id: 'contemporary',
    name: 'Contemporary',
    description: 'Bold design, mixed materials, statement pieces',
    icon: '🎯',
    prompt: 'contemporary interior design, bold design choices, mixed materials, statement furniture pieces, modern lighting, geometric patterns, neutral background with colorful accents'
  },
  {
    id: 'dark-modern',
    name: 'Dark Modern',
    description: 'Black furniture, wood elements, plants',
    icon: '🏠',
    prompt: 'Modern dark interior with warm wood flooring and exposed wooden ceiling beams. Transform all white furniture to black including the refrigerator, square table, and island bench. Keep the white kitchen marble for contrast. Add abundant indoor plants for a vibrant, natural atmosphere. Professional photography lighting with warm tones.'
  }
];

// Before/After Examples for inspiration
export const BEFORE_AFTER_EXAMPLES = [
  {
    id: 'wall-transformation',
    title: 'Wall Material Transformation',
    description: 'Plain white walls transformed with modern texture',
    beforeImage: '/examples/before-after/before-wall-material.jpg',
    afterImage: '/examples/before-after/after-wall-material.jpg',
    style: 'Wall Material',
    prompt: 'Modern textured wall with clean finish'
  },
  {
    id: 'flooring-transformation',
    title: 'Flooring Makeover',
    description: 'Basic floor transformed with premium hardwood',
    beforeImage: '/examples/before-after/before-flooring.jpg',
    afterImage: '/examples/before-after/after-flooring.jpg',
    style: 'Flooring',
    prompt: 'Premium hardwood flooring with warm oak tones'
  },
  {
    id: 'lighting-enhancement',
    title: 'Lighting Enhancement',
    description: 'Dark room transformed with warm, inviting lighting',
    beforeImage: '/examples/before-after/before-lighting.jpg',
    afterImage: '/examples/before-after/after-lighting.jpg',
    style: 'Lighting',
    prompt: 'Warm natural lighting creating cozy atmosphere'
  },
  {
    id: 'complete-room-transformation',
    title: 'Complete Room Transformation',
    description: 'Empty room fully staged with modern furniture',
    beforeImage: '/examples/before-after/before-complete-room.jpg',
    afterImage: '/examples/before-after/after-complete-room.jpg',
    style: 'Complete Style',
    prompt: 'Modern minimalist furniture arrangement with clean aesthetic'
  },
  {
    id: 'furniture-update',
    title: 'Furniture Style Update',
    description: 'Old furniture replaced with contemporary pieces',
    beforeImage: '/examples/before-after/before-furniture.jpg',
    afterImage: '/examples/before-after/after-furniture.jpg',
    style: 'Furniture',
    prompt: 'Modern Scandinavian furniture with clean lines'
  },
  {
    id: 'color-scheme-change',
    title: 'Color Scheme Transformation',
    description: 'Neutral room transformed with vibrant color palette',
    beforeImage: '/examples/before-after/before-color-scheme.jpg',
    afterImage: '/examples/before-after/after-color-scheme.jpg',
    style: 'Color Scheme',
    prompt: 'Vibrant blue and teal color scheme throughout'
  },
  {
    id: 'scandinavian-living-room-transformation',
    title: 'Living Room to Scandinavian Style',
    description: 'Dark room transformed into bright Scandinavian living room with salamander',
    beforeImage: '/examples/before-after/Before.webp',
    afterImage: '/examples/before-after/After.png',
    style: 'Complete Style',
    prompt: 'Transform this environment into a living room (maintaining the salamander, and ensure the overall style is Scandinavian style, add warm lighting because the environment is very dark in its interior)'
  }
];

// Real Estate editing presets for ControlNet
export const REAL_ESTATE_PRESETS = [
  {
    id: 'wall-material',
    name: 'Wall Material',
    description: 'Change wall materials (brick, plaster, stone, etc.)',
    icon: '🧱',
    preprocess: 'canny',
    controlScale: 0.8,
    controlStart: 0,
    controlEnd: 0.9,
    defaultPrompt: 'changes wall material while preserving furniture and lighting'
  },
  {
    id: 'flooring',
    name: 'Flooring',
    description: 'Replace flooring material (tile, wood, marble, etc.)',
    icon: '🪵',
    preprocess: 'depth',
    controlScale: 0.7,
    controlStart: 0.3,
    controlEnd: 0.95,
    defaultPrompt: 'replaces flooring while maintaining perspective and room depth'
  },
  {
    id: 'furniture',
    name: 'Furniture',
    description: 'Update furniture style and pieces',
    icon: '🪑',
    preprocess: 'hed',
    controlScale: 0.85,
    controlStart: 0,
    controlEnd: 0.95,
    defaultPrompt: 'updates furniture while preserving room structure and lighting'
  },
  {
    id: 'lighting',
    name: 'Lighting',
    description: 'Adjust lighting and atmosphere',
    icon: '💡',
    preprocess: 'normal',
    controlScale: 0.6,
    controlStart: 0.4,
    controlEnd: 0.8,
    defaultPrompt: 'adjusts lighting while maintaining room composition'
  },
  {
    id: 'style',
    name: 'Complete Style',
    description: 'Complete room style transformation',
    icon: '🏠',
    preprocess: 'none',
    controlScale: 0.6,
    controlStart: 0.4,
    controlEnd: 0.8,
    defaultPrompt: 'transforms room style while maintaining structure and composition'
  }
];

// Edit existing property using ControlNet
export async function editProperty(inputImage, prompt, options = {}) {
  const {
    controlScale = 0.75,      // Influence of control (0-1)
    controlStart = 0,           // When control starts (0-1)
    controlEnd = 0.8,           // When control ends (0-1)
    preprocess = 'canny',         // Type of control
    numInferenceSteps = 50,
    negativePrompt = '',
  } = options;

  try {
    // Build enhanced prompt with style
    let enhancedPrompt = prompt;

    const response = await fetch(`${FAL_API_BASE}/${FAL_CONTROLNET_MODEL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${FAL_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        image_url: inputImage,          // Original photo from user
        control_scale: controlScale,
        control_start: controlStart,
        control_end: controlEnd,
        preprocess: preprocess,           // Canny/depth/hed/normal/none
        num_inference_steps: numInferenceSteps,
        negative_prompt: negativePrompt,
        sync_mode: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to edit property');
    }

    const data = await response.json();

    // Format response to match expected structure
    return {
      imageUrl: data.image?.url || data.images?.[0]?.url,
      success: true,
      requestId: data.request_id || Date.now().toString(),
    };
  } catch (error) {
    console.error('ControlNet API error:', error);
    throw error;
  }
}

// Calculate credits for ControlNet editing
export function calculateControlNetCredits(width, height, preprocessType) {
  // ControlNet is more expensive than pure generation
  // Base cost is approximately $0.02-0.05 per edit

  const megapixels = (width * height) / 1000000;

  // Simple credit system: 1 edit = 1 credit
  const credits = 1;

  return credits;
}

// Helper function to get preset by ID
export function getPresetById(presetId) {
  return REAL_ESTATE_PRESETS.find(preset => preset.id === presetId);
}

// Real Estate editing presets for Qwen Image Edit
export const QWEN_REAL_ESTATE_PRESETS = [
  {
    id: 'wall-material',
    name: 'Wall Material',
    description: 'Change wall materials (brick, plaster, stone, etc.)',
    icon: '🧱',
    defaultPrompt: 'Changes wall material while preserving furniture and lighting',
    example: 'Modern white plaster walls with clean texture'
  },
  {
    id: 'flooring',
    name: 'Flooring',
    description: 'Replace flooring material (tile, wood, marble, etc.)',
    icon: '🪵',
    defaultPrompt: 'Replaces flooring while maintaining perspective and room depth',
    example: 'Oak hardwood flooring with warm tones'
  },
  {
    id: 'furniture',
    name: 'Furniture',
    description: 'Update furniture style and pieces',
    icon: '🪑',
    defaultPrompt: 'Updates furniture while preserving room structure and lighting',
    example: 'Modern Scandinavian furniture with clean lines'
  },
  {
    id: 'lighting',
    name: 'Lighting',
    description: 'Adjust lighting and atmosphere',
    icon: '💡',
    defaultPrompt: 'Adjusts lighting while maintaining room composition',
    example: 'Warm natural lighting creating cozy atmosphere'
  },
  {
    id: 'style',
    name: 'Complete Style',
    description: 'Complete room style transformation',
    icon: '🏠',
    defaultPrompt: 'Transforms room style while maintaining structure and composition',
    example: 'Modern minimalist style with neutral tones'
  },
  {
    id: 'color-scheme',
    name: 'Color Scheme',
    description: 'Change overall color palette',
    icon: '🎨',
    defaultPrompt: 'Changes color scheme while preserving all furniture and layout',
    example: 'Cool blue and gray tones throughout'
  }
];

// Edit property using Qwen Image Edit API
export async function editPropertyQwen(inputImage, prompt, options = {}) {
  const {
    style = 'natural',  // natural, vivid, portrait
    negativePrompt = '',
    strength = 0.8,      // How much to change the image (0-1)
  } = options;

  try {
    // Build enhanced prompt with Real Estate context
    let enhancedPrompt = prompt;
    if (style) {
      const styleMap = {
        'natural': 'natural lighting, photorealistic, professional real estate photography',
        'vivid': 'vibrant colors, dramatic lighting, high contrast',
        'portrait': 'warm soft lighting, intimate atmosphere',
      };
      enhancedPrompt = `${styleMap[style] || ''}, ${prompt}`;
    }

    // Handle base64 images
    let imageUrl = inputImage;
    if (inputImage.startsWith('data:')) {
      // For base64 images, we might need to upload them first
      // For now, assume the API can handle base64 directly
      imageUrl = inputImage;
    }

    // Call Qwen Image Edit API
    const response = await fetch(`${QWEN_API_BASE}api/v1/services/aigc/image-edit/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'X-DashScope-Async': 'enable',  // Enable async mode for large images
      },
      body: JSON.stringify({
        model: 'qwen-image-edit',  // Qwen Image Edit model
        input: {
          prompt: enhancedPrompt,
          image: imageUrl,
          negative_prompt: negativePrompt,
        },
        parameters: {
          strength: strength,  // How much to change (0-1)
          size: '1024*1024',  // Standard HD size
          n: 1,  // Number of images to generate
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Qwen API error:', errorText);
      throw new Error(`Failed to edit property: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Handle async response (Qwen returns task_id for large images)
    if (data.output && data.output.task_id) {
      // Poll for result
      const result = await pollQwenTask(data.output.task_id);
      return {
        imageUrl: result.results[0].url,
        success: true,
        requestId: data.output.task_id,
        stage: 'qwen-only',
      };
    } else if (data.output && data.output.results) {
      // Direct result
      return {
        imageUrl: data.output.results[0].url,
        success: true,
        requestId: Date.now().toString(),
        stage: 'qwen-only',
      };
    } else {
      throw new Error('Unexpected response format from Qwen API');
    }
  } catch (error) {
    console.error('Qwen Image Edit error:', error);
    throw new Error(`Qwen Image Edit failed: ${error.message}`);
  }
}

// Sample real estate images for demonstration
export const SAMPLE_REAL_ESTATE_IMAGES = [
  {
    id: 'living-room-modern',
    title: 'Modern Living Room',
    description: 'Spacious modern living room with large windows',
    imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1024&h=768&fit=crop',
    originalPrompt: 'Modern living room with large windows, hardwood flooring, neutral colors',
  },
  {
    id: 'bedroom-cozy',
    title: 'Cozy Bedroom',
    description: 'Warm and inviting bedroom with natural light',
    imageUrl: 'https://images.unsplash.com/photo-1616594039964-40891a9095b7?w=1024&h=768&fit=crop',
    originalPrompt: 'Cozy bedroom with natural light, soft bedding, wooden furniture',
  },
  {
    id: 'kitchen-modern',
    title: 'Modern Kitchen',
    description: 'Contemporary kitchen with modern appliances',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1024&h=768&fit=crop',
    originalPrompt: 'Modern kitchen with stainless steel appliances, marble countertops',
  },
  {
    id: 'bathroom-luxury',
    title: 'Luxury Bathroom',
    description: 'Elegant bathroom with premium finishes',
    imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1024&h=768&fit=crop',
    originalPrompt: 'Luxury bathroom with marble walls, rainfall shower, modern fixtures',
  }
];
