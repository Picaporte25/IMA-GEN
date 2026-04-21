import { useState, useRef } from 'react';
import { QWEN_REAL_ESTATE_PRESETS, editPropertyQwen, calculateCredits, getQwenPresetById, SAMPLE_REAL_ESTATE_IMAGES } from '@/lib/nanoBanana';

export default function QwenPropertyEditor({ userCredits, onCreditUpdate }) {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonPosition, setComparisonPosition] = useState(50);
  const comparisonSliderRef = useRef(null);

  // Reference image state
  const [referenceImage, setReferenceImage] = useState(null);
  const [referenceImageUrl, setReferenceImageUrl] = useState('');
  const [referencePreviewUrl, setReferencePreviewUrl] = useState('');

  const creditsNeeded = selectedPreset
    ? calculateCredits(1024, 1024, 0.8)
    : 0;

  const hasEnoughCredits = userCredits >= creditsNeeded;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please upload an image file (JPG, PNG, WebP, etc.)');
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      setUploadedImage(file);
      setError('');
      setShowComparison(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlInput = (e) => {
    const url = e.target.value.trim();
    if (url) {
      setPreviewUrl(url);
      setImageUrl(url);
      setUploadedImage(null);
      setError('');
      setShowComparison(false);
    }
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    setCustomPrompt('');
    setError('');
  };

  const handleSampleSelect = (sample) => {
    setPreviewUrl(sample.imageUrl);
    setOriginalPrompt(sample.originalPrompt);
    setUploadedImage(null);
    setImageUrl('');
    setError('');
    setShowComparison(false);
  };

  const handleReferenceImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please upload an image file (JPG, PNG, WebP, etc.) for reference');
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setReferencePreviewUrl(reader.result);
      setReferenceImage(file);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleReferenceUrlInput = (e) => {
    const url = e.target.value.trim();
    if (url) {
      setReferencePreviewUrl(url);
      setReferenceImageUrl(url);
      setReferenceImage(null);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const finalPrompt = customPrompt.trim() || selectedPreset?.defaultPrompt || prompt.trim();

    if (!finalPrompt) {
      setError('Please provide editing instructions');
      return;
    }

    if (!uploadedImage && !imageUrl) {
      setError('Please upload an image, provide a URL, or select a sample');
      return;
    }

    if (!selectedPreset) {
      setError('Please select an editing preset');
      return;
    }

    if (!hasEnoughCredits) {
      setError(`Not enough credits. You need ${creditsNeeded - userCredits} more credits.`);
      return;
    }

    setEditing(true);

    try {
      const inputImage = imageUrl || previewUrl;
      let finalPromptWithCustom = customPrompt.trim()
        ? `${selectedPreset.defaultPrompt}, ${customPrompt}`
        : finalPrompt;

      // Add reference image information to prompt if provided
      if (referencePreviewUrl) {
        finalPromptWithCustom = `${finalPromptWithCustom}. Use the provided reference image as inspiration for the desired style and result.`;
      }

      const response = await editPropertyQwen(
        inputImage,
        finalPromptWithCustom,
        {
          style: 'natural',
          strength: 0.8,
        }
      );

      setSuccess('Property transformed successfully!');
      onCreditUpdate(userCredits - creditsNeeded);
      setResultUrl(response.imageUrl);
      setShowComparison(true);

      // Scroll to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Failed to transform property. Please try again.');
    } finally {
      setEditing(false);
    }
  };

  const handleSliderChange = (e) => {
    setComparisonPosition(parseFloat(e.target.value));
  };

  const handleSliderMouseDown = (e) => {
    const handleMouseMove = (e) => {
      const rect = comparisonSliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setComparisonPosition(x * 100);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="card-glass">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-violet-500">
            AI-Powered Real Estate Transformation
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Transform your property photos with Qwen AI while preserving 100% of the original structure.
            Select a sample or upload your own image to get started.
          </p>
        </div>

        {/* Sample Images */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-white">Try with a sample image</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SAMPLE_REAL_ESTATE_IMAGES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSampleSelect(sample)}
                className={`style-card ${previewUrl === sample.imageUrl ? 'selected' : ''}`}
                disabled={editing}
              >
                <img
                  src={sample.imageUrl}
                  alt={sample.title}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <div className="text-sm font-semibold text-white">{sample.title}</div>
                <div className="text-xs text-gray-400 mt-1">{sample.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Panel - Input */}
        <div className="card-glass">
          <h3 className="text-2xl font-bold mb-6 text-violet-500">Original Image</h3>

          {!previewUrl ? (
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-400 mb-4">Select a sample or upload your own image</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Supported formats: JPG, PNG, WebP</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border border-gray-600">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  {originalPrompt && (
                    <p className="text-sm text-gray-300">
                      <span className="text-orange-400 font-medium">Original:</span> {originalPrompt}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-400 mb-2">
                  Or paste image URL
                </label>
                <input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={handleUrlInput}
                  placeholder="https://example.com/property-image.jpg"
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-40 text-sm"
                  disabled={editing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Upload your own image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={editing}
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-40 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-violet-600 file:text-white hover:file:bg-violet-700"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Results */}
        <div className="card-glass">
          <h3 className="text-2xl font-bold mb-6 text-violet-500">Result</h3>

          {showComparison && resultUrl && previewUrl ? (
            <div className="space-y-4">
              {/* Before/After Comparison Slider */}
              <div
                ref={comparisonSliderRef}
                className="relative rounded-lg overflow-hidden border border-gray-600"
                style={{ height: '400px' }}
                onMouseDown={handleSliderMouseDown}
              >
                {/* After Image (Background) */}
                <img
                  src={resultUrl}
                  alt="After"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Before Image (Foreground with clip) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    clipPath: `inset(0 ${(100 - comparisonPosition)}% 0 0)`,
                  }}
                >
                  <img
                    src={previewUrl}
                    alt="Before"
                    className="w-full h-full object-cover"
                    style={{ width: `${100 / (comparisonPosition / 100)}%` }}
                  />
                </div>

                {/* Slider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white cursor-move"
                  style={{ left: `${comparisonPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                </div>

                {/* Labels */}
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
                  Before
                </div>
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
                  After
                </div>
              </div>

              {/* Download Button */}
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(previewUrl, '_blank')}
                  className="flex-1 btn-secondary text-sm"
                  disabled={editing}
                >
                  Download Original
                </button>
                <button
                  onClick={() => window.open(resultUrl, '_blank')}
                  className="flex-1 btn-primary text-sm"
                  disabled={editing}
                >
                  Download Result
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <p className="text-gray-400 mb-2">Your transformed image will appear here</p>
              <p className="text-sm text-gray-500">Select an image, choose a preset, and click Transform</p>
            </div>
          )}
        </div>
      </div>

      {/* Transformation Controls */}
      {previewUrl && (
        <form onSubmit={handleSubmit} className="card-glass">
          <h3 className="text-2xl font-bold mb-6 text-violet-500">Transformation Controls</h3>

          {/* Editing Presets */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-3">
              What would you like to transform? <span className="text-orange-500">*</span>
            </label>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {QWEN_REAL_ESTATE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`style-card ${selectedPreset?.id === preset.id ? 'selected' : ''}`}
                  disabled={editing}
                >
                  <div className="text-2xl mb-2">{preset.icon}</div>
                  <div className="text-sm font-semibold text-white">{preset.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Preset Details */}
          {selectedPreset && (
            <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-600">
              <h4 className="text-lg font-semibold text-white mb-2">
                {selectedPreset.icon} {selectedPreset.name}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="text-gray-400">
                  <span className="text-white">What it does:</span> {selectedPreset.description}
                </div>
                <div className="text-gray-400">
                  <span className="text-white">Example result:</span> {selectedPreset.example}
                </div>
                <div className="text-gray-400">
                  <span className="text-white">AI instruction:</span> {selectedPreset.defaultPrompt}
                </div>
                {referencePreviewUrl && (
                  <div className="text-green-400 font-medium mt-3 pt-3 border-t border-gray-700">
                    ✓ Using reference image for guidance
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Custom Instructions */}
          <div className="mb-6">
            <label htmlFor="customPrompt" className="block text-sm font-medium text-gray-400 mb-2">
              Additional instructions (optional)
            </label>
            <textarea
              id="customPrompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add specific details to your transformation (e.g., 'make the walls terracotta brick', 'use modern white sofa'...)"
              className="textarea-futuristic"
              rows={3}
              disabled={editing}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to use the preset's default instructions.
            </p>
          </div>

          {/* Reference Image Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Reference image (optional) 📷
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Upload or paste a reference image to show the AI exactly what style you want to achieve.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {/* File Upload */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  Upload reference image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReferenceImageUpload}
                  disabled={editing}
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-40 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-violet-600 file:text-white hover:file:bg-violet-700"
                />
              </div>

              {/* URL Input */}
              <div>
                <label htmlFor="referenceImageUrl" className="block text-xs font-medium text-gray-400 mb-2">
                  Or paste reference image URL
                </label>
                <input
                  id="referenceImageUrl"
                  type="url"
                  value={referenceImageUrl}
                  onChange={handleReferenceUrlInput}
                  placeholder="https://example.com/reference-image.jpg"
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-40 text-sm"
                  disabled={editing}
                />
              </div>
            </div>

            {/* Reference Image Preview */}
            {referencePreviewUrl && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border border-gray-600">
                    <img
                      src={referencePreviewUrl}
                      alt="Reference"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium mb-1">
                      ✓ Reference image loaded
                    </p>
                    <p className="text-xs text-gray-400">
                      The AI will use this image as inspiration for your transformation.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setReferenceImage(null);
                        setReferenceImageUrl('');
                        setReferencePreviewUrl('');
                      }}
                      className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                      disabled={editing}
                    >
                      Remove reference image
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cost Summary */}
          <div className="mb-6 bg-gray-800 rounded-lg p-6 border border-gray-600">
            <h4 className="text-lg font-semibold text-white mb-4">Cost Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">AI Engine:</span>
                <span className="font-medium text-orange-400">
                  🤖 Qwen Image Edit
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Available credits:</span>
                <span className={`text-xl font-bold ${hasEnoughCredits ? 'text-green-500' : 'text-red-500'}`}>
                  {userCredits}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Transformation cost:</span>
                <span className="text-white font-medium">{creditsNeeded} credits</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Credits remaining:</span>
                <span className="text-2xl font-bold text-white">
                  {hasEnoughCredits ? userCredits - creditsNeeded : 'N/A'}
                </span>
              </div>
              {!hasEnoughCredits && selectedPreset && (
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
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-500 text-sm">{success}</p>
            </div>
          )}

          {/* Transform Button */}
          <button
            type="submit"
            disabled={editing || !previewUrl || !selectedPreset}
            className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {editing ? (
              <>
                <div className="spinner-small" />
                <span>Transforming Property...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <div className="flex items-center gap-2">
                  <span>Transform Property</span>
                  {referencePreviewUrl && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                      📷 + Reference
                    </span>
                  )}
                </div>
              </>
            )}
          </button>
        </form>
      )}

      {/* How It Works */}
      <div className="card-glass">
        <h3 className="text-2xl font-bold mb-6 text-violet-500">How It Works</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500/20 to-violet-500/20 flex items-center justify-center border border-orange-500/30">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold mb-2 text-white">1. Select or Upload</h4>
            <p className="text-gray-400 text-sm">Choose a sample property photo or upload your own image</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500/20 to-violet-500/20 flex items-center justify-center border border-violet-500/30">
              <svg className="w-8 h-8 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold mb-2 text-white">2. Choose Transformation</h4>
            <p className="text-gray-400 text-sm">Select what you want to change: walls, floors, furniture, lighting, or complete style</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500/20 to-violet-500/20 flex items-center justify-center border border-blue-500/30">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold mb-2 text-white">3. Add Reference (Optional)</h4>
            <p className="text-gray-400 text-sm">Upload or paste a reference image to guide the AI transformation</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500/20 to-violet-500/20 flex items-center justify-center border border-green-500/30">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold mb-2 text-white">4. See Results</h4>
            <p className="text-gray-400 text-sm">View your transformed image with before/after comparison slider</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="card-glass">
        <h3 className="text-2xl font-bold mb-6 text-violet-500">Key Features</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30 flex-shrink-0">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">100% Structure Preservation</h4>
              <p className="text-sm text-gray-400">Original room layout, perspective, and architectural details remain unchanged</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30 flex-shrink-0">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Lightning Fast</h4>
              <p className="text-sm text-gray-400">Transformations completed in seconds using advanced AI technology</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Reference Image Support</h4>
              <p className="text-sm text-gray-400">Upload reference images to guide AI with visual examples</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30 flex-shrink-0">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Professional Quality</h4>
              <p className="text-sm text-gray-400">High-resolution results suitable for real estate listings and marketing</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30 flex-shrink-0">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Cost Effective</h4>
              <p className="text-sm text-gray-400">Pay-per-use model with no subscriptions, credits never expire</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
