import { useState } from 'react';
import { REAL_ESTATE_STYLES, BEFORE_AFTER_EXAMPLES, calculateCredits, IMAGE_RESOLUTIONS } from '@/lib/nanoBanana';

export default function EnhancedImageGenerator({ userCredits, onCreditUpdate }) {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [resolution, setResolution] = useState(IMAGE_RESOLUTIONS[2]); // Default to 1024x1024
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedExample, setSelectedExample] = useState(null);
  const [showExamples, setShowExamples] = useState(false);

  const creditsNeeded = calculateCredits(resolution.width, resolution.height, numberOfImages);
  const hasEnoughCredits = userCredits >= creditsNeeded;

  const handleStyleSelect = (style) => {
    setSelectedStyle(style.id);
    setPrompt(style.prompt);
    setError('');
  };

  const handleExampleSelect = (example) => {
    setSelectedExample(example);
    setPrompt(example.prompt);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!prompt.trim()) {
      setError('Please enter a prompt or select a style');
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate images');
      }

      setSuccess('Room generated successfully!');
      onCreditUpdate(userCredits - creditsNeeded);
      setPrompt('');
      setNegativePrompt('');
      setSelectedExample(null);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Failed to generate room. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Inspiration Gallery - Before/After Examples */}
      <div className="card-glass">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-violet-500">💡 Inspiration Gallery</h2>
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            {showExamples ? 'Hide Examples' : 'Show Examples'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showExamples ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              )}
            </svg>
          </button>
        </div>

        {showExamples && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BEFORE_AFTER_EXAMPLES.map((example) => (
              <button
                key={example.id}
                type="button"
                onClick={() => handleExampleSelect(example)}
                className={`style-card p-4 ${selectedExample?.id === example.id ? 'selected' : ''}`}
                disabled={generating}
              >
                <div className="flex gap-2 mb-2">
                  <img
                    src={example.beforeImage}
                    alt="Before"
                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-600"
                  />
                  <img
                    src={example.afterImage}
                    alt="After"
                    className="w-20 h-20 object-cover rounded-lg border-2 border-green-500"
                  />
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-white">{example.title}</div>
                  <div className="text-xs text-gray-400 mt-1">{example.description}</div>
                  <div className="text-xs text-violet-400 mt-2">
                    Style: {example.style}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Room Generation Form */}
      <div className="card-glass">
        <h2 className="text-2xl font-bold mb-6 text-violet-500">🏠 Generate New Room</h2>

        {/* Style Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Choose a Style (Optional) 🎨
          </label>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedStyle('');
                setPrompt('');
                setError('');
              }}
              className={`style-card ${selectedStyle === '' ? 'selected' : ''}`}
              disabled={generating}
            >
              <div className="text-2xl mb-2">✏️</div>
              <div className="text-sm font-semibold text-white">Custom</div>
              <div className="text-xs text-gray-400">Write your own prompt</div>
            </button>

            {REAL_ESTATE_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => handleStyleSelect(style)}
                className={`style-card ${selectedStyle === style.id ? 'selected' : ''}`}
                disabled={generating}
              >
                <div className="text-2xl mb-2">{style.icon}</div>
                <div className="text-sm font-semibold text-white">{style.name}</div>
                <div className="text-xs text-gray-400 mt-1">{style.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Style Details */}
        {selectedStyle && (
          <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-2">
              Selected Style
            </h3>
            <div className="space-y-2 text-sm">
              <div className="text-gray-400">
                <span className="text-white">Style:</span> {REAL_ESTATE_STYLES.find(s => s.id === selectedStyle)?.name}
              </div>
              <div className="text-gray-400">
                <span className="text-white">Auto-generated prompt:</span> {REAL_ESTATE_STYLES.find(s => s.id === selectedStyle)?.prompt}
              </div>
              <div className="text-violet-400 font-medium">
                💡 You can modify this prompt below or add your own instructions
              </div>
            </div>
          </div>
        )}

        {/* Manual Prompt Input */}
        <div className="mb-6">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-400 mb-2">
            Room Description / Prompt <span className="text-orange-500">*</span>
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your room (e.g., 'modern living room with large windows and hardwood flooring') or select a style above"
            className="textarea-futuristic"
            rows={4}
            disabled={generating}
          />
          {selectedStyle && (
            <p className="text-xs text-violet-400 mt-2">
              🎯 Using "{REAL_ESTATE_STYLES.find(s => s.id === selectedStyle)?.name}" style prompt. You can modify it above.
            </p>
          )}
        </div>

        {/* Negative Prompt */}
        <div className="mb-6">
          <label htmlFor="negativePrompt" className="block text-sm font-medium text-gray-400 mb-2">
            Negative Prompt (Optional)
          </label>
          <textarea
            id="negativePrompt"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="What to avoid (e.g., 'people, pets, clutter')"
            className="textarea-futuristic"
            rows={2}
            disabled={generating}
          />
          <p className="text-xs text-gray-500 mt-1">
            Use this to specify what you don't want in the generated image.
          </p>
        </div>

        {/* Resolution Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Resolution
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {IMAGE_RESOLUTIONS.map((res) => (
              <button
                key={res.id}
                type="button"
                onClick={() => setResolution(res)}
                className={`style-card text-center ${resolution.id === res.id ? 'selected' : ''}`}
                disabled={generating}
              >
                <div className="text-xs font-semibold text-white mb-1">{res.label.split(' (')[0]}</div>
                <div className="text-xs text-gray-400">{res.label.split(' (')[1]?.replace(')', '')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Number of Images */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Number of Images
          </label>
          <div className="flex gap-3">
            {[1, 2, 4].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setNumberOfImages(num)}
                className={`style-card flex-1 ${numberOfImages === num ? 'selected' : ''}`}
                disabled={generating}
              >
                <div className="text-lg font-bold text-white">{num}</div>
                <div className="text-xs text-gray-400">image{num !== 1 ? 's' : ''}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Cost Summary */}
        <div className="mb-6 bg-gray-800 rounded-lg p-6 border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-4">Cost Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Available credits:</span>
              <span className={`text-xl font-bold ${hasEnoughCredits ? 'text-green-500' : 'text-red-500'}`}>
                {userCredits}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Generation cost:</span>
              <span className="text-white font-medium">{creditsNeeded} credits</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Credits remaining:</span>
              <span className="text-2xl font-bold text-white">
                {hasEnoughCredits ? userCredits - creditsNeeded : 'N/A'}
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
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
            <p className="text-green-500 text-sm">{success}</p>
          </div>
        )}

        {/* Generate Button */}
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={generating || !prompt.trim()}
          className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <div className="spinner-small" />
              <span>Generating Room...</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0h6m-6 0v6m0-0v-6m0-0v6m0-0v6m0 0v6m0 0v6m0 0v6" />
              </svg>
              <span>Generate Room</span>
            </>
          )}
        </button>
      </div>

      {/* Tips Section */}
      <div className="card-glass">
        <h3 className="text-2xl font-bold mb-6 text-violet-500">💡 Pro Tips</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30 flex-shrink-0">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Start with Styles</h4>
              <p className="text-sm text-gray-400">Use predefined styles for consistent, professional results</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30 flex-shrink-0">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Get Inspired</h4>
              <p className="text-sm text-gray-400">Browse the gallery for transformation ideas</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30 flex-shrink-0">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Be Specific</h4>
              <p className="text-sm text-gray-400">Include details like lighting, furniture, colors</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30 flex-shrink-0">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm0 0v1m0 1h12m0 1h12m0 1h12" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Use Negative Prompts</h4>
              <p className="text-sm text-gray-400">Specify what to avoid for cleaner results</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
