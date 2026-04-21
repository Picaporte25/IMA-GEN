import { useState } from 'react';
import { IMAGE_STYLES, IMAGE_RESOLUTIONS, calculateCredits } from '@/lib/nanoBanana';

export default function ImageGenerator({ userCredits, onCreditUpdate }) {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [resolution, setResolution] = useState(IMAGE_RESOLUTIONS[2]); // Default to 1024x1024
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const creditsNeeded = calculateCredits(resolution.width, resolution.height, numberOfImages);
  const hasEnoughCredits = userCredits >= creditsNeeded;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (!hasEnoughCredits) {
      setError('Not enough credits. Please purchase more.');
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          negativePrompt: negativePrompt.trim(),
          style: selectedStyle,
          width: resolution.width,
          height: resolution.height,
          numberOfImages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          setError('Not enough credits.');
          return;
        }
        throw new Error(data.error || 'Failed to generate image');
      }

      setSuccess('Image generated successfully!');
      onCreditUpdate(data.remainingCredits);
      setPrompt('');
      setNegativePrompt('');

      // Scroll to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Failed to generate image. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="card-glass max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-violet-500">Stage Your Room</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Prompt Input */}
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-400 mb-2">
            Describe your room <span className="text-orange-500">*</span>
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A modern living room with contemporary furniture, warm lighting, floor-to-ceiling windows..."
            className="textarea-futuristic"
            rows={4}
            disabled={generating}
          />
        </div>

        {/* Negative Prompt */}
        <div>
          <label htmlFor="negativePrompt" className="block text-sm font-medium text-gray-400 mb-2">
            Negative prompt (what to avoid)
          </label>
          <textarea
            id="negativePrompt"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="clutter, dated furniture, poor lighting, dark spaces..."
            className="textarea-futuristic"
            rows={2}
            disabled={generating}
          />
        </div>

        {/* Style Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Design Style (optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setSelectedStyle('')}
              className={`style-card text-center ${!selectedStyle ? 'selected' : ''}`}
              disabled={generating}
            >
              <div className="text-lg font-semibold text-white">None</div>
              <div className="text-xs text-gray-400 mt-1">Default style</div>
            </button>
            {IMAGE_STYLES.slice(0, 3).map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setSelectedStyle(style.id)}
                className={`style-card text-center ${selectedStyle === style.id ? 'selected' : ''}`}
                disabled={generating}
              >
                <div className="text-sm font-semibold text-white">{style.name}</div>
                <div className="text-xs text-gray-400 mt-1">{style.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Resolution and Number of Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resolution */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Image Quality
            </label>
            <div className="space-y-2">
              {IMAGE_RESOLUTIONS.map((res) => (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => setResolution(res)}
                  className={`w-full style-card flex items-center justify-between ${resolution.id === res.id ? 'selected' : ''}`}
                  disabled={generating}
                >
                  <span className="font-medium text-white">{res.label}</span>
                  <span className="text-xs text-gray-400">
                    {calculateCredits(res.width, res.height, 1)} credits
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Number of Images */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Number of Variations
            </label>
            <div className="space-y-2">
              {[1, 2, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setNumberOfImages(num)}
                  className={`w-full style-card text-center ${numberOfImages === num ? 'selected' : ''}`}
                  disabled={generating}
                >
                  <span className="font-medium text-white">{num} variation{num > 1 ? 's' : ''}</span>
                  <span className="block text-xs text-gray-400 mt-1">
                    {calculateCredits(resolution.width, resolution.height, num)} credits
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-4">Cost Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Image quality:</span>
              <span className="text-white font-medium">{resolution.label}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Number of variations:</span>
              <span className="text-white font-medium">{numberOfImages}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total cost:</span>
              <span className={`text-2xl font-bold ${hasEnoughCredits ? 'text-orange-500' : 'text-red-500'}`}>
                {creditsNeeded} credits
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-600">
              <span className="text-gray-400">Available credits:</span>
              <span className={`text-xl font-bold ${hasEnoughCredits ? 'text-green-500' : 'text-red-500'}`}>
                {userCredits}
              </span>
            </div>
            {!hasEnoughCredits && (
              <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                <p className="text-red-500 text-sm mb-2">
                  You need {creditsNeeded - userCredits} more credits
                </p>
                <button
                  type="button"
                  onClick={() => window.location.href = '/pricing'}
                  className="btn-primary w-full text-sm"
                >
                  Buy Credits
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-500 text-sm">{success}</p>
          </div>
        )}

        {/* Generate Button */}
        <button
          type="submit"
          disabled={generating || !prompt.trim() || !hasEnoughCredits}
          className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <div className="spinner-small" />
              <span>Staging room...</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Stage Room{numberOfImages > 1 ? 's' : ''}</span>
            </>
          )}
        </button>
      </form>

      {/* Tips */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Tips for better staging
        </h3>
        <ul className="text-sm text-gray-500 space-y-2 list-disc list-inside">
          <li>Be specific about room type and desired furniture style</li>
          <li>Include details about lighting, colors, and atmosphere</li>
          <li>Use negative prompts to avoid cluttered or dated looks</li>
          <li>Higher quality costs more credits but produces better MLS results</li>
          <li>Multiple variations give you more staging options to choose from</li>
        </ul>
      </div>
    </div>
  );
}
