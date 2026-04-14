const FAL_API_KEY = process.env.FAL_API_KEY || 'abdb3c06-54db-490f-8cbc-8a6cac05dc6b:f749901fdce27be595bc31196aecf775';
const FAL_API_BASE = 'https://fal.run';
const FAL_IMAGE_MODEL = 'fal-ai/nano-banana-2';

export async function generateImage(prompt, options = {}) {
  const {
    negativePrompt = '',
    style = '',
    width = 1024,
    height = 1024,
    numberOfImages = 1,
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

    // Map resolution to Nano Banana 2 format
    const resolution = mapResolutionToNanoBanana(width, height);
    const aspectRatio = mapWidthHeightToAspectRatio(width, height);

    const response = await fetch(`${FAL_API_BASE}/${FAL_IMAGE_MODEL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${FAL_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        num_images: numberOfImages,
        aspect_ratio: aspectRatio,
        resolution: resolution,
        output_format: 'png',
        safety_tolerance: '4',
        limit_generations: true,
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
  // Calculate credits based on Nano Banana 2 pricing
  // Base cost is $0.08 per image (1K resolution)
  const baseCost = 1; // 1 credit = base image

  // Map resolution to multiplier according to Nano Banana 2 pricing
  const resolution = mapResolutionToNanoBanana(width, height);
  const resolutionMultiplier = {
    '0.5K': 0.75,
    '1K': 1,
    '2K': 1.5,
    '4K': 2,
  }[resolution] || 1;

  const totalCost = Math.ceil(baseCost * resolutionMultiplier * numberOfImages);

  return totalCost;
}

// Helper function to map width/height to Nano Banana 2 resolution
function mapResolutionToNanoBanana(width, height) {
  const maxDimension = Math.max(width, height);

  if (maxDimension <= 512) return '0.5K';
  if (maxDimension <= 1024) return '1K';
  if (maxDimension <= 1536) return '2K';
  return '4K';
}

// Helper function to map width/height to aspect ratio
function mapWidthHeightToAspectRatio(width, height) {
  const ratio = width / height;

  // Map to the closest supported aspect ratio
  const aspectRatios = {
    '21:9': 21/9,     // ~2.33
    '16:9': 16/9,     // ~1.78
    '3:2': 3/2,       // 1.5
    '4:3': 4/3,       // ~1.33
    '5:4': 5/4,       // 1.25
    '1:1': 1,         // 1
    '4:5': 4/5,       // 0.8
    '3:4': 3/4,       // 0.75
    '2:3': 2/3,       // ~0.67
    '9:16': 9/16,     // 0.5625
    '4:1': 4,         // 4
    '1:4': 1/4,       // 0.25
    '8:1': 8,         // 8
    '1:8': 1/8,       // 0.125
  };

  // Find closest aspect ratio
  let closestRatio = 'auto';
  let minDiff = Infinity;

  for (const [name, value] of Object.entries(aspectRatios)) {
    const diff = Math.abs(ratio - value);
    if (diff < minDiff) {
      minDiff = diff;
      closestRatio = name;
    }
  }

  return closestRatio;
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
  { id: '512x512', width: 512, height: 512, label: '512×512 (Fast - 0.75× cost)' },
  { id: '768x768', width: 768, height: 768, label: '768×768 (Balanced - 1× cost)' },
  { id: '1024x1024', width: 1024, height: 1024, label: '1024×1024 (HD - 1× cost)' },
  { id: '1536x1536', width: 1536, height: 1536, label: '1536×1536 (UHD - 1.5× cost)' },
  { id: '2048x2048', width: 2048, height: 2048, label: '2048×2048 (4K - 2× cost)' },
];
